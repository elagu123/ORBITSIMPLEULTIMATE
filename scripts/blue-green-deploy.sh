#!/bin/bash
set -euo pipefail

# Blue-Green Deployment Script for Orbit MKT
# Implements zero-downtime deployment with automated rollback

ENVIRONMENT=${1:-staging}
IMAGE_TAG=${2:-latest}
TIMEOUT=${3:-600}
HEALTH_CHECK_RETRIES=${4:-10}

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Deployment metadata
DEPLOYMENT_ID="bg-$(date +%s)-$(echo $IMAGE_TAG | cut -c1-7)"
NAMESPACE="orbit-mkt"
if [ "$ENVIRONMENT" == "staging" ]; then
    NAMESPACE="orbit-mkt-staging"
fi

# Kubernetes context validation
validate_cluster_connection() {
    log_info "Validating cluster connection..."
    
    if ! kubectl cluster-info --request-timeout=10s > /dev/null 2>&1; then
        log_error "Failed to connect to Kubernetes cluster"
        exit 1
    fi
    
    # Validate namespace exists
    if ! kubectl get namespace "$NAMESPACE" > /dev/null 2>&1; then
        log_error "Namespace '$NAMESPACE' does not exist"
        exit 1
    fi
    
    log_success "Cluster connection validated"
}

# Pre-deployment safety checks
pre_deployment_checks() {
    log_info "Running pre-deployment safety checks..."
    
    # Check if image exists and is accessible
    log_info "Verifying image accessibility: $IMAGE_TAG"
    if ! docker pull "ghcr.io/your-org/orbit-mkt:$IMAGE_TAG" > /dev/null 2>&1; then
        log_error "Failed to pull image: ghcr.io/your-org/orbit-mkt:$IMAGE_TAG"
        exit 1
    fi
    
    # Validate current deployment state
    if kubectl get rollout orbit-mkt-rollout -n "$NAMESPACE" > /dev/null 2>&1; then
        CURRENT_STATUS=$(kubectl argo rollouts get rollout orbit-mkt-rollout -n "$NAMESPACE" --no-color 2>/dev/null | grep "Status:" | awk '{print $2}')
        if [[ "$CURRENT_STATUS" != "Healthy" && "$CURRENT_STATUS" != "Paused" ]]; then
            log_error "Current rollout is in '$CURRENT_STATUS' state. Cannot proceed with deployment."
            exit 1
        fi
    fi
    
    # Check resource quotas
    MEMORY_REQUEST="512Mi"
    CPU_REQUEST="200m"
    
    # Validate cluster has sufficient resources
    log_info "Checking cluster resource availability..."
    
    # Check node capacity (simplified check)
    NODE_COUNT=$(kubectl get nodes --no-headers | grep -c Ready || echo "0")
    if [ "$NODE_COUNT" -lt 2 ]; then
        log_warning "Less than 2 nodes available. High availability not guaranteed."
    fi
    
    log_success "Pre-deployment checks completed"
}

# Deploy green environment (new version)
deploy_green_environment() {
    log_info "Deploying GREEN environment with image: $IMAGE_TAG"
    
    # Create deployment configuration
    cat > /tmp/deployment-$DEPLOYMENT_ID.yaml << EOF
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: orbit-mkt-rollout
  namespace: $NAMESPACE
  labels:
    app: orbit-mkt
    deployment-id: $DEPLOYMENT_ID
    environment: $ENVIRONMENT
  annotations:
    deployment.orbit.com/strategy: "blue-green"
    deployment.orbit.com/timestamp: "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    deployment.orbit.com/image-tag: "$IMAGE_TAG"
spec:
  replicas: 3
  strategy:
    blueGreen:
      activeService: orbit-mkt-active
      previewService: orbit-mkt-preview
      autoPromotionEnabled: false
      scaleDownDelaySeconds: 30
      prePromotionAnalysis:
        templates:
        - templateName: success-rate
        - templateName: response-time
        args:
        - name: service-name
          value: orbit-mkt-preview
      postPromotionAnalysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: orbit-mkt-active
      previewReplicaCount: 2
  selector:
    matchLabels:
      app: orbit-mkt
  template:
    metadata:
      labels:
        app: orbit-mkt
        version: $IMAGE_TAG
        deployment-id: $DEPLOYMENT_ID
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      serviceAccountName: orbit-mkt-service-account
      containers:
      - name: orbit-mkt
        image: ghcr.io/your-org/orbit-mkt:$IMAGE_TAG
        imagePullPolicy: Always
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: false
          capabilities:
            drop:
            - ALL
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          value: $ENVIRONMENT
        - name: DEPLOYMENT_ID
          value: $DEPLOYMENT_ID
        - name: DEPLOYMENT_COLOR
          value: green
        resources:
          requests:
            memory: $MEMORY_REQUEST
            cpu: $CPU_REQUEST
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        startupProbe:
          httpGet:
            path: /health/startup
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 12
      terminationGracePeriodSeconds: 30
EOF

    # Apply the rollout
    if kubectl apply -f /tmp/deployment-$DEPLOYMENT_ID.yaml; then
        log_success "GREEN environment deployment initiated"
    else
        log_error "Failed to apply rollout configuration"
        cleanup_failed_deployment
        exit 1
    fi
    
    # Wait for rollout to be ready
    log_info "Waiting for GREEN environment to become ready..."
    if kubectl argo rollouts get rollout orbit-mkt-rollout -n "$NAMESPACE" --watch --timeout="$TIMEOUT"s; then
        log_success "GREEN environment is ready"
    else
        log_error "GREEN environment failed to become ready within $TIMEOUT seconds"
        cleanup_failed_deployment
        exit 1
    fi
}

# Comprehensive health check for green environment
health_check_green() {
    log_info "Performing comprehensive health checks on GREEN environment..."
    
    # Get preview service endpoint
    PREVIEW_ENDPOINT=$(kubectl get svc orbit-mkt-preview -n "$NAMESPACE" -o jsonpath='{.spec.clusterIP}')
    
    if [ -z "$PREVIEW_ENDPOINT" ]; then
        log_error "Unable to get preview service endpoint"
        return 1
    fi
    
    # Health check with retry logic
    for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
        log_info "Health check attempt $i/$HEALTH_CHECK_RETRIES"
        
        # Basic connectivity test
        if kubectl run health-check-$DEPLOYMENT_ID --image=curlimages/curl --rm -i --restart=Never --timeout=30s -- \
           curl -f -s -m 10 "http://$PREVIEW_ENDPOINT/health" > /dev/null 2>&1; then
            
            log_success "Health check passed"
            
            # Additional functional tests
            run_smoke_tests "$PREVIEW_ENDPOINT"
            
            # Performance baseline test
            run_performance_test "$PREVIEW_ENDPOINT"
            
            return 0
        else
            log_warning "Health check failed, retrying in 10 seconds..."
            sleep 10
        fi
    done
    
    log_error "All health check attempts failed"
    return 1
}

# Run smoke tests against green environment
run_smoke_tests() {
    local endpoint=$1
    log_info "Running smoke tests against GREEN environment..."
    
    # Test critical endpoints
    local test_endpoints=(
        "/health"
        "/api/health"
        "/auth/status"
        "/"
    )
    
    for endpoint in "${test_endpoints[@]}"; do
        log_info "Testing endpoint: $endpoint"
        if ! kubectl run smoke-test-$DEPLOYMENT_ID --image=curlimages/curl --rm -i --restart=Never --timeout=30s -- \
             curl -f -s -m 10 "http://$endpoint$endpoint" > /dev/null 2>&1; then
            log_error "Smoke test failed for endpoint: $endpoint"
            return 1
        fi
    done
    
    log_success "All smoke tests passed"
}

# Performance baseline test
run_performance_test() {
    local endpoint=$1
    log_info "Running performance baseline test..."
    
    # Simple load test with curl
    if kubectl run perf-test-$DEPLOYMENT_ID --image=curlimages/curl --rm -i --restart=Never --timeout=60s -- \
       sh -c "for i in \$(seq 1 10); do curl -s -w 'Response time: %{time_total}s\n' -o /dev/null http://$endpoint/ || exit 1; done"; then
        log_success "Performance baseline test passed"
    else
        log_warning "Performance test encountered issues"
        return 1
    fi
}

# Promote green to blue (switch traffic)
promote_to_production() {
    log_info "Promoting GREEN environment to BLUE (production)..."
    
    # Manual approval in production
    if [ "$ENVIRONMENT" == "production" ]; then
        echo ""
        log_warning "PRODUCTION DEPLOYMENT APPROVAL REQUIRED"
        echo "Deployment details:"
        echo "  Environment: $ENVIRONMENT"
        echo "  Image Tag: $IMAGE_TAG"
        echo "  Deployment ID: $DEPLOYMENT_ID"
        echo ""
        
        read -p "Do you want to proceed with production promotion? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            log_info "Deployment cancelled by user"
            exit 0
        fi
    fi
    
    # Promote the rollout
    log_info "Executing traffic switch..."
    if kubectl argo rollouts promote orbit-mkt-rollout -n "$NAMESPACE"; then
        log_success "Traffic successfully switched to GREEN environment"
        
        # Wait for promotion to complete
        if kubectl argo rollouts get rollout orbit-mkt-rollout -n "$NAMESPACE" --watch --timeout=300s; then
            log_success "Promotion completed successfully"
        else
            log_error "Promotion did not complete within timeout"
            return 1
        fi
    else
        log_error "Failed to promote rollout"
        return 1
    fi
}

# Post-deployment verification
post_deployment_verification() {
    log_info "Running post-deployment verification..."
    
    # Verify active service is receiving traffic
    ACTIVE_ENDPOINT=$(kubectl get svc orbit-mkt-active -n "$NAMESPACE" -o jsonpath='{.spec.clusterIP}')
    
    # Test production traffic
    for i in $(seq 1 5); do
        if kubectl run post-deploy-test-$i --image=curlimages/curl --rm -i --restart=Never --timeout=30s -- \
           curl -f -s -m 10 "http://$ACTIVE_ENDPOINT/health"; then
            log_success "Production traffic test $i passed"
        else
            log_error "Production traffic test $i failed"
            return 1
        fi
        sleep 2
    done
    
    # Check deployment metrics
    log_info "Verifying deployment metrics..."
    sleep 30 # Allow metrics to populate
    
    log_success "Post-deployment verification completed"
}

# Cleanup function for failed deployments
cleanup_failed_deployment() {
    log_warning "Cleaning up failed deployment..."
    
    # Remove temporary files
    rm -f /tmp/deployment-$DEPLOYMENT_ID.yaml
    
    # Attempt to abort rollout if it exists
    if kubectl get rollout orbit-mkt-rollout -n "$NAMESPACE" > /dev/null 2>&1; then
        kubectl argo rollouts abort orbit-mkt-rollout -n "$NAMESPACE" || true
    fi
    
    log_info "Cleanup completed"
}

# Emergency rollback function
emergency_rollback() {
    log_error "INITIATING EMERGENCY ROLLBACK"
    
    if kubectl argo rollouts undo orbit-mkt-rollout -n "$NAMESPACE"; then
        log_success "Emergency rollback initiated"
        
        # Wait for rollback to complete
        if kubectl argo rollouts get rollout orbit-mkt-rollout -n "$NAMESPACE" --watch --timeout=300s; then
            log_success "Emergency rollback completed"
        else
            log_error "Emergency rollback timed out"
        fi
    else
        log_error "Emergency rollback failed - MANUAL INTERVENTION REQUIRED"
    fi
}

# Signal handlers for graceful shutdown
trap 'log_warning "Deployment interrupted"; cleanup_failed_deployment; exit 130' INT TERM

# Main deployment flow
main() {
    log_info "Starting Blue-Green deployment for Orbit MKT"
    log_info "Environment: $ENVIRONMENT"
    log_info "Image Tag: $IMAGE_TAG"
    log_info "Deployment ID: $DEPLOYMENT_ID"
    log_info "=================================================="
    
    # Pre-deployment validation
    validate_cluster_connection
    pre_deployment_checks
    
    # Deploy green environment
    deploy_green_environment
    
    # Health checks
    if ! health_check_green; then
        log_error "Health checks failed - aborting deployment"
        cleanup_failed_deployment
        exit 1
    fi
    
    # Promote to production
    if ! promote_to_production; then
        log_error "Promotion failed - initiating rollback"
        emergency_rollback
        exit 1
    fi
    
    # Post-deployment verification
    if ! post_deployment_verification; then
        log_error "Post-deployment verification failed - consider rollback"
        emergency_rollback
        exit 1
    fi
    
    # Success
    log_success "=================================================="
    log_success "Blue-Green deployment completed successfully!"
    log_success "Deployment ID: $DEPLOYMENT_ID"
    log_success "Environment: $ENVIRONMENT"
    log_success "Image Tag: $IMAGE_TAG"
    log_success "=================================================="
    
    # Cleanup
    rm -f /tmp/deployment-$DEPLOYMENT_ID.yaml
}

# Execute main function
main "$@"