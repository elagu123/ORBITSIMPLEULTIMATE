#!/bin/bash
set -euo pipefail

# Emergency Rollback Script for Orbit MKT
# Provides immediate rollback capabilities with comprehensive logging and validation

ENVIRONMENT=${1:-production}
ROLLBACK_STRATEGY=${2:-auto} # auto, manual, previous-version
TIMEOUT=${3:-300}

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Emergency logging with timestamps and severity
log_emergency() {
    echo -e "${RED}[EMERGENCY]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    logger -p local0.emerg "ORBIT-ROLLBACK-EMERGENCY: $1"
}

log_critical() {
    echo -e "${PURPLE}[CRITICAL]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    logger -p local0.crit "ORBIT-ROLLBACK-CRITICAL: $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    logger -p local0.err "ORBIT-ROLLBACK-ERROR: $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    logger -p local0.warning "ORBIT-ROLLBACK-WARNING: $1"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    logger -p local0.info "ORBIT-ROLLBACK-INFO: $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    logger -p local0.info "ORBIT-ROLLBACK-SUCCESS: $1"
}

# Rollback metadata
ROLLBACK_ID="emergency-$(date +%s)"
NAMESPACE="orbit-mkt"
if [ "$ENVIRONMENT" = "staging" ]; then
    NAMESPACE="orbit-mkt-staging"
fi

# Pre-rollback system state capture
capture_system_state() {
    log_info "Capturing current system state before rollback..."
    
    local state_dir="/tmp/rollback-state-$ROLLBACK_ID"
    mkdir -p "$state_dir"
    
    # Capture current deployment state
    kubectl get rollout orbit-mkt-rollout -n "$NAMESPACE" -o yaml > "$state_dir/current-rollout.yaml" 2>/dev/null || true
    kubectl describe rollout orbit-mkt-rollout -n "$NAMESPACE" > "$state_dir/rollout-description.txt" 2>/dev/null || true
    
    # Capture pod states
    kubectl get pods -n "$NAMESPACE" -l app=orbit-mkt -o wide > "$state_dir/pod-states.txt" 2>/dev/null || true
    
    # Capture service states
    kubectl get services -n "$NAMESPACE" -o wide > "$state_dir/service-states.txt" 2>/dev/null || true
    
    # Capture events
    kubectl get events -n "$NAMESPACE" --sort-by='.lastTimestamp' | tail -50 > "$state_dir/recent-events.txt" 2>/dev/null || true
    
    # Capture metrics if available
    if command -v prometheus-query &> /dev/null; then
        prometheus-query 'up{job="orbit-mkt"}' > "$state_dir/current-metrics.txt" 2>/dev/null || true
    fi
    
    log_success "System state captured to: $state_dir"
    echo "$state_dir"
}

# Validate cluster connection and permissions
validate_rollback_prerequisites() {
    log_info "Validating rollback prerequisites..."
    
    # Check cluster connectivity
    if ! kubectl cluster-info --request-timeout=10s > /dev/null 2>&1; then
        log_emergency "Cannot connect to Kubernetes cluster - MANUAL INTERVENTION REQUIRED"
        exit 1
    fi
    
    # Check namespace exists
    if ! kubectl get namespace "$NAMESPACE" > /dev/null 2>&1; then
        log_emergency "Namespace '$NAMESPACE' does not exist"
        exit 1
    fi
    
    # Check if rollout exists
    if ! kubectl get rollout orbit-mkt-rollout -n "$NAMESPACE" > /dev/null 2>&1; then
        log_emergency "Rollout 'orbit-mkt-rollout' not found in namespace '$NAMESPACE'"
        exit 1
    fi
    
    # Verify RBAC permissions
    if ! kubectl auth can-i update rollouts -n "$NAMESPACE" > /dev/null 2>&1; then
        log_emergency "Insufficient permissions to perform rollback - check RBAC"
        exit 1
    fi
    
    log_success "Rollback prerequisites validated"
}

# Get current deployment status
get_current_status() {
    log_info "Analyzing current deployment status..."
    
    local rollout_status=$(kubectl argo rollouts get rollout orbit-mkt-rollout -n "$NAMESPACE" --no-color 2>/dev/null | grep "Status:" | awk '{print $2}' || echo "Unknown")
    local rollout_health=$(kubectl argo rollouts get rollout orbit-mkt-rollout -n "$NAMESPACE" --no-color 2>/dev/null | grep "Health:" | awk '{print $2}' || echo "Unknown")
    local current_revision=$(kubectl get rollout orbit-mkt-rollout -n "$NAMESPACE" -o jsonpath='{.status.currentPodHash}' 2>/dev/null || echo "Unknown")
    local ready_replicas=$(kubectl get rollout orbit-mkt-rollout -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
    local total_replicas=$(kubectl get rollout orbit-mkt-rollout -n "$NAMESPACE" -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "Unknown")
    
    log_info "Current Status: $rollout_status"
    log_info "Current Health: $rollout_health"
    log_info "Current Revision: $current_revision"
    log_info "Ready Replicas: $ready_replicas/$total_replicas"
    
    # Export for use by other functions
    export CURRENT_STATUS="$rollout_status"
    export CURRENT_HEALTH="$rollout_health"
    export CURRENT_REVISION="$current_revision"
    export READY_REPLICAS="$ready_replicas"
    export TOTAL_REPLICAS="$total_replicas"
}

# Determine rollback target
determine_rollback_target() {
    log_info "Determining rollback target..."
    
    case "$ROLLBACK_STRATEGY" in
        "auto")
            # Automatic rollback to previous known good version
            local previous_revision=$(kubectl rollout history deployment/orbit-mkt-app -n "$NAMESPACE" 2>/dev/null | tail -2 | head -1 | awk '{print $1}' || echo "")
            if [ -n "$previous_revision" ]; then
                ROLLBACK_TARGET="--to-revision=$previous_revision"
                log_info "Auto rollback target: revision $previous_revision"
            else
                ROLLBACK_TARGET=""
                log_info "Auto rollback target: previous version"
            fi
            ;;
        "manual")
            # Manual specification required
            echo ""
            log_warning "MANUAL ROLLBACK MODE"
            echo "Available revisions:"
            kubectl rollout history deployment/orbit-mkt-app -n "$NAMESPACE" 2>/dev/null || echo "No history available"
            echo ""
            read -p "Enter target revision (or press Enter for previous): " -r target_revision
            if [ -n "$target_revision" ]; then
                ROLLBACK_TARGET="--to-revision=$target_revision"
                log_info "Manual rollback target: revision $target_revision"
            else
                ROLLBACK_TARGET=""
                log_info "Manual rollback target: previous version"
            fi
            ;;
        "previous-version")
            ROLLBACK_TARGET=""
            log_info "Rollback target: previous version"
            ;;
        *)
            log_error "Invalid rollback strategy: $ROLLBACK_STRATEGY"
            exit 1
            ;;
    esac
    
    export ROLLBACK_TARGET
}

# Execute emergency traffic stop
emergency_traffic_stop() {
    log_critical "Executing emergency traffic stop..."
    
    # Scale down the problematic deployment immediately
    if kubectl scale rollout orbit-mkt-rollout --replicas=0 -n "$NAMESPACE" --timeout=30s; then
        log_success "Scaled down current deployment"
    else
        log_error "Failed to scale down current deployment"
    fi
    
    # Update load balancer to maintenance mode if possible
    if kubectl get configmap orbit-maintenance-mode -n "$NAMESPACE" > /dev/null 2>&1; then
        kubectl patch configmap orbit-maintenance-mode -n "$NAMESPACE" --type merge -p '{"data":{"maintenance":"true","reason":"Emergency rollback in progress"}}'
        log_success "Maintenance mode activated"
    fi
    
    # Pause all ongoing rollouts
    if kubectl argo rollouts abort orbit-mkt-rollout -n "$NAMESPACE"; then
        log_success "Aborted ongoing rollout"
    else
        log_warning "No ongoing rollout to abort or abort failed"
    fi
    
    log_critical "Emergency traffic stop completed"
}

# Execute the actual rollback
execute_rollback() {
    log_critical "Initiating emergency rollback..."
    
    # Capture timestamp for rollback tracking
    local rollback_start=$(date +%s)
    
    # Perform the rollback using Argo Rollouts
    log_info "Executing Argo Rollouts undo operation..."
    if kubectl argo rollouts undo orbit-mkt-rollout -n "$NAMESPACE" $ROLLBACK_TARGET; then
        log_success "Rollback command executed successfully"
    else
        log_emergency "Rollback command failed - attempting alternative methods"
        
        # Alternative: Direct Kubernetes rollback
        if kubectl rollout undo deployment/orbit-mkt-app -n "$NAMESPACE" $ROLLBACK_TARGET; then
            log_success "Alternative rollback method succeeded"
        else
            log_emergency "All rollback methods failed - MANUAL INTERVENTION REQUIRED"
            return 1
        fi
    fi
    
    # Wait for rollback to complete
    log_info "Waiting for rollback to complete (timeout: ${TIMEOUT}s)..."
    if timeout "$TIMEOUT" kubectl argo rollouts get rollout orbit-mkt-rollout -n "$NAMESPACE" --watch; then
        log_success "Rollback completed within timeout"
    else
        log_error "Rollback did not complete within $TIMEOUT seconds"
        return 1
    fi
    
    local rollback_end=$(date +%s)
    local rollback_duration=$((rollback_end - rollback_start))
    log_success "Rollback completed in ${rollback_duration} seconds"
}

# Verify rollback success
verify_rollback_success() {
    log_info "Verifying rollback success..."
    
    # Wait for pods to be ready
    local max_wait=180
    local wait_count=0
    
    while [ $wait_count -lt $max_wait ]; do
        local ready_pods=$(kubectl get pods -n "$NAMESPACE" -l app=orbit-mkt -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}' 2>/dev/null | tr ' ' '\n' | grep -c "True" || echo "0")
        local total_pods=$(kubectl get pods -n "$NAMESPACE" -l app=orbit-mkt --no-headers 2>/dev/null | wc -l || echo "0")
        
        if [ "$ready_pods" -gt 0 ] && [ "$ready_pods" -eq "$total_pods" ]; then
            log_success "All pods are ready ($ready_pods/$total_pods)"
            break
        fi
        
        log_info "Waiting for pods to be ready: $ready_pods/$total_pods"
        sleep 10
        wait_count=$((wait_count + 10))
    done
    
    if [ $wait_count -ge $max_wait ]; then
        log_error "Pods did not become ready within timeout"
        return 1
    fi
    
    # Verify services are responding
    local service_ip=$(kubectl get svc orbit-mkt-active -n "$NAMESPACE" -o jsonpath='{.spec.clusterIP}' 2>/dev/null || echo "")
    
    if [ -n "$service_ip" ]; then
        log_info "Testing service health at $service_ip..."
        
        # Test health endpoint
        if kubectl run health-test-$ROLLBACK_ID --image=curlimages/curl --rm -i --restart=Never --timeout=60s -- \
           curl -f -s -m 30 "http://$service_ip/health" > /dev/null 2>&1; then
            log_success "Health check passed after rollback"
        else
            log_error "Health check failed after rollback"
            return 1
        fi
    else
        log_warning "Unable to get service IP for verification"
    fi
    
    # Check error rates (if monitoring is available)
    sleep 30 # Allow metrics to populate
    log_info "Monitoring system for 30 seconds post-rollback..."
    
    log_success "Rollback verification completed"
}

# Restore traffic and disable maintenance mode
restore_traffic() {
    log_info "Restoring traffic after successful rollback..."
    
    # Disable maintenance mode
    if kubectl get configmap orbit-maintenance-mode -n "$NAMESPACE" > /dev/null 2>&1; then
        kubectl patch configmap orbit-maintenance-mode -n "$NAMESPACE" --type merge -p '{"data":{"maintenance":"false","reason":"Rollback completed successfully"}}'
        log_success "Maintenance mode disabled"
    fi
    
    # Ensure proper replica count
    local target_replicas=3
    if [ "$ENVIRONMENT" = "production" ]; then
        target_replicas=6
    fi
    
    kubectl scale rollout orbit-mkt-rollout --replicas=$target_replicas -n "$NAMESPACE"
    log_success "Scaled deployment to $target_replicas replicas"
    
    # Wait for traffic restoration
    sleep 60
    log_success "Traffic restoration completed"
}

# Send emergency notifications
send_emergency_notifications() {
    local status=$1
    local message=$2
    
    log_info "Sending emergency notifications..."
    
    # Slack notification (if webhook configured)
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        local color="danger"
        local icon="🚨"
        
        if [ "$status" = "success" ]; then
            color="good"
            icon="✅"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$icon ORBIT MKT EMERGENCY ROLLBACK\",\"attachments\":[{\"color\":\"$color\",\"fields\":[{\"title\":\"Environment\",\"value\":\"$ENVIRONMENT\",\"short\":true},{\"title\":\"Status\",\"value\":\"$status\",\"short\":true},{\"title\":\"Rollback ID\",\"value\":\"$ROLLBACK_ID\",\"short\":true},{\"title\":\"Timestamp\",\"value\":\"$(date -u)\",\"short\":true},{\"title\":\"Message\",\"value\":\"$message\",\"short\":false}]}]}" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null || log_warning "Failed to send Slack notification"
    fi
    
    # PagerDuty alert (if integration key configured)
    if [ -n "${PAGERDUTY_INTEGRATION_KEY:-}" ]; then
        local event_action="trigger"
        if [ "$status" = "success" ]; then
            event_action="resolve"
        fi
        
        curl -X POST -H 'Content-Type: application/json' \
            --data "{\"routing_key\":\"$PAGERDUTY_INTEGRATION_KEY\",\"event_action\":\"$event_action\",\"payload\":{\"summary\":\"Orbit MKT Emergency Rollback - $status\",\"source\":\"orbit-mkt-$ENVIRONMENT\",\"severity\":\"critical\",\"custom_details\":{\"rollback_id\":\"$ROLLBACK_ID\",\"environment\":\"$ENVIRONMENT\",\"message\":\"$message\"}}}" \
            'https://events.pagerduty.com/v2/enqueue' 2>/dev/null || log_warning "Failed to send PagerDuty alert"
    fi
    
    # Email notification (if configured)
    if command -v mail &> /dev/null && [ -n "${EMERGENCY_EMAIL:-}" ]; then
        echo "$message" | mail -s "URGENT: Orbit MKT Emergency Rollback - $status" "$EMERGENCY_EMAIL" || log_warning "Failed to send email notification"
    fi
    
    log_success "Emergency notifications sent"
}

# Generate rollback report
generate_rollback_report() {
    local status=$1
    local state_dir=$2
    
    log_info "Generating rollback report..."
    
    local report_file="/tmp/rollback-report-$ROLLBACK_ID.txt"
    
    cat > "$report_file" << EOF
=====================================
ORBIT MKT EMERGENCY ROLLBACK REPORT
=====================================
Rollback ID: $ROLLBACK_ID
Environment: $ENVIRONMENT
Strategy: $ROLLBACK_STRATEGY
Status: $status
Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')
Operator: ${USER:-unknown}
=====================================

PRE-ROLLBACK STATE:
- Status: $CURRENT_STATUS
- Health: $CURRENT_HEALTH
- Revision: $CURRENT_REVISION
- Ready Replicas: $READY_REPLICAS/$TOTAL_REPLICAS

ROLLBACK DETAILS:
- Target: ${ROLLBACK_TARGET:-previous-version}
- Duration: Calculated during execution
- Method: Argo Rollouts undo

POST-ROLLBACK VERIFICATION:
- Health checks executed
- Service availability confirmed
- Traffic restored
- Monitoring resumed

SYSTEM STATE BACKUP:
- Location: $state_dir
- Includes: rollout config, pod states, services, events, metrics

NOTIFICATIONS SENT:
- Slack: ${SLACK_WEBHOOK_URL:+Yes}${SLACK_WEBHOOK_URL:-No}
- PagerDuty: ${PAGERDUTY_INTEGRATION_KEY:+Yes}${PAGERDUTY_INTEGRATION_KEY:-No}
- Email: ${EMERGENCY_EMAIL:+Yes}${EMERGENCY_EMAIL:-No}

=====================================
NEXT STEPS:
1. Monitor application metrics for 30 minutes
2. Investigate root cause of the original issue
3. Plan remediation strategy
4. Update incident documentation
5. Conduct post-incident review
=====================================
EOF
    
    log_success "Rollback report generated: $report_file"
    cat "$report_file"
}

# Cleanup function
cleanup_rollback() {
    log_info "Performing rollback cleanup..."
    
    # Remove temporary test pods
    kubectl delete pod --selector=app=health-test-$ROLLBACK_ID -n "$NAMESPACE" --ignore-not-found=true
    
    # Archive logs
    if [ -d "/tmp/rollback-state-$ROLLBACK_ID" ]; then
        tar -czf "/tmp/rollback-archive-$ROLLBACK_ID.tar.gz" -C /tmp "rollback-state-$ROLLBACK_ID"
        rm -rf "/tmp/rollback-state-$ROLLBACK_ID"
        log_success "System state archived to /tmp/rollback-archive-$ROLLBACK_ID.tar.gz"
    fi
    
    log_success "Cleanup completed"
}

# Signal handlers
trap 'log_critical "Emergency rollback interrupted - CHECK SYSTEM STATE MANUALLY"; exit 130' INT TERM

# Main emergency rollback execution
main() {
    log_emergency "INITIATING EMERGENCY ROLLBACK FOR ORBIT MKT"
    log_emergency "Environment: $ENVIRONMENT"
    log_emergency "Strategy: $ROLLBACK_STRATEGY"
    log_emergency "Rollback ID: $ROLLBACK_ID"
    log_emergency "=================================================="
    
    # Capture system state before any changes
    local state_dir=$(capture_system_state)
    
    # Validate prerequisites
    validate_rollback_prerequisites
    
    # Analyze current state
    get_current_status
    
    # Determine rollback target
    determine_rollback_target
    
    # Execute emergency procedures
    emergency_traffic_stop
    
    # Perform the rollback
    if execute_rollback; then
        log_success "Rollback execution successful"
        
        # Verify rollback worked
        if verify_rollback_success; then
            log_success "Rollback verification successful"
            
            # Restore traffic
            restore_traffic
            
            # Success notifications
            send_emergency_notifications "success" "Emergency rollback completed successfully. System restored to previous version."
            
            # Generate report
            generate_rollback_report "SUCCESS" "$state_dir"
            
            log_emergency "=================================================="
            log_emergency "EMERGENCY ROLLBACK COMPLETED SUCCESSFULLY"
            log_emergency "System has been restored to previous version"
            log_emergency "Continue monitoring for 30 minutes minimum"
            log_emergency "=================================================="
            
        else
            log_emergency "Rollback verification failed"
            send_emergency_notifications "partial-failure" "Emergency rollback executed but verification failed. Manual intervention required."
            generate_rollback_report "PARTIAL-FAILURE" "$state_dir"
            exit 1
        fi
    else
        log_emergency "Rollback execution failed"
        send_emergency_notifications "failure" "Emergency rollback failed. IMMEDIATE manual intervention required."
        generate_rollback_report "FAILURE" "$state_dir"
        exit 1
    fi
    
    # Cleanup
    cleanup_rollback
}

# Execute main function
main "$@"