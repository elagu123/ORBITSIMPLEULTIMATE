#!/bin/bash
set -euo pipefail

# Comprehensive Security Scanning and Compliance Check for Orbit MKT
# Prevents deployment catastrophes through exhaustive security validation

ENVIRONMENT=${1:-staging}
SCAN_TYPE=${2:-all} # all, dependencies, secrets, containers, compliance
SEVERITY_THRESHOLD=${3:-medium} # low, medium, high, critical
FAIL_ON_CRITICAL=${4:-true}

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Security scan results
TOTAL_SCANS=0
PASSED_SCANS=0
FAILED_SCANS=0
WARNING_SCANS=0
CRITICAL_ISSUES=0
HIGH_ISSUES=0
MEDIUM_ISSUES=0
LOW_ISSUES=0

# Report file
SCAN_ID="sec-$(date +%s)"
REPORT_DIR="/tmp/security-scan-$SCAN_ID"
mkdir -p "$REPORT_DIR"
SECURITY_REPORT="$REPORT_DIR/security-report.json"

# Logging functions
log_security() {
    echo -e "${PURPLE}[SECURITY]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    logger -p local0.info "ORBIT-SECURITY: $1"
}

log_critical() {
    echo -e "${RED}[CRITICAL]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    logger -p local0.crit "ORBIT-SECURITY-CRITICAL: $1"
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    logger -p local0.err "ORBIT-SECURITY-ERROR: $1"
    FAILED_SCANS=$((FAILED_SCANS + 1))
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    logger -p local0.warning "ORBIT-SECURITY-WARNING: $1"
    WARNING_SCANS=$((WARNING_SCANS + 1))
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    logger -p local0.info "ORBIT-SECURITY-SUCCESS: $1"
    PASSED_SCANS=$((PASSED_SCANS + 1))
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
    logger -p local0.info "ORBIT-SECURITY-INFO: $1"
}

# Initialize security report
init_security_report() {
    cat > "$SECURITY_REPORT" << EOF
{
  "scan_id": "$SCAN_ID",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$ENVIRONMENT",
  "scan_type": "$SCAN_TYPE",
  "severity_threshold": "$SEVERITY_THRESHOLD",
  "scans": [],
  "summary": {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "warnings": 0,
    "issues": {
      "critical": 0,
      "high": 0,
      "medium": 0,
      "low": 0
    }
  }
}
EOF
    log_info "Security report initialized: $SECURITY_REPORT"
}

# Add scan result to report
add_scan_result() {
    local scan_name=$1
    local status=$2
    local issues_found=$3
    local details=${4:-"{}"}
    
    TOTAL_SCANS=$((TOTAL_SCANS + 1))
    
    # Create temporary file with scan result
    cat > "/tmp/scan_result.json" << EOF
{
  "name": "$scan_name",
  "status": "$status",
  "issues_found": $issues_found,
  "details": $details,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
    
    # Add to main report using jq
    if command -v jq &> /dev/null; then
        jq ".scans += [$(cat /tmp/scan_result.json)]" "$SECURITY_REPORT" > "/tmp/temp_report.json"
        mv "/tmp/temp_report.json" "$SECURITY_REPORT"
    fi
    
    rm -f "/tmp/scan_result.json"
}

# Dependency vulnerability scanning
scan_dependencies() {
    log_security "Starting dependency vulnerability scan..."
    
    local issues_found=0
    local details="{}"
    
    # Node.js dependencies audit
    if [ -f "package.json" ]; then
        log_info "Scanning Node.js dependencies..."
        
        if npm audit --audit-level=moderate --json > "$REPORT_DIR/npm-audit.json" 2>/dev/null; then
            log_success "npm audit completed"
            
            # Parse results
            if command -v jq &> /dev/null; then
                local vulnerabilities=$(jq '.vulnerabilities | length' "$REPORT_DIR/npm-audit.json" 2>/dev/null || echo "0")
                issues_found=$((issues_found + vulnerabilities))
                
                if [ "$vulnerabilities" -gt 0 ]; then
                    log_warning "Found $vulnerabilities npm vulnerabilities"
                    
                    # Count by severity
                    local critical=$(jq '[.vulnerabilities[] | select(.severity=="critical")] | length' "$REPORT_DIR/npm-audit.json" 2>/dev/null || echo "0")
                    local high=$(jq '[.vulnerabilities[] | select(.severity=="high")] | length' "$REPORT_DIR/npm-audit.json" 2>/dev/null || echo "0")
                    local medium=$(jq '[.vulnerabilities[] | select(.severity=="moderate")] | length' "$REPORT_DIR/npm-audit.json" 2>/dev/null || echo "0")
                    local low=$(jq '[.vulnerabilities[] | select(.severity=="low")] | length' "$REPORT_DIR/npm-audit.json" 2>/dev/null || echo "0")
                    
                    CRITICAL_ISSUES=$((CRITICAL_ISSUES + critical))
                    HIGH_ISSUES=$((HIGH_ISSUES + high))
                    MEDIUM_ISSUES=$((MEDIUM_ISSUES + medium))
                    LOW_ISSUES=$((LOW_ISSUES + low))
                    
                    details="{\"npm_vulnerabilities\": $vulnerabilities, \"critical\": $critical, \"high\": $high, \"medium\": $medium, \"low\": $low}"
                    
                    if [ "$critical" -gt 0 ]; then
                        log_critical "Critical npm vulnerabilities found: $critical"
                    fi
                fi
            fi
        else
            log_error "npm audit failed"
            issues_found=$((issues_found + 1))
        fi
    fi
    
    # Python dependencies (if applicable)
    if [ -f "requirements.txt" ] || [ -f "Pipfile" ]; then
        log_info "Scanning Python dependencies..."
        
        if command -v safety &> /dev/null; then
            if safety check --json > "$REPORT_DIR/safety-check.json" 2>/dev/null; then
                log_success "Python safety check completed"
            else
                log_warning "Python safety check found issues"
                issues_found=$((issues_found + 1))
            fi
        else
            log_warning "Safety tool not installed - skipping Python dependency scan"
        fi
    fi
    
    # Docker base image vulnerabilities
    if [ -f "Dockerfile" ]; then
        log_info "Scanning Docker base images..."
        
        if command -v trivy &> /dev/null; then
            if trivy fs --format json --output "$REPORT_DIR/trivy-fs.json" .; then
                log_success "Trivy filesystem scan completed"
                
                # Parse Trivy results
                if command -v jq &> /dev/null; then
                    local trivy_vulns=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity == "CRITICAL" or .Severity == "HIGH")] | length' "$REPORT_DIR/trivy-fs.json" 2>/dev/null || echo "0")
                    if [ "$trivy_vulns" -gt 0 ]; then
                        log_warning "Trivy found $trivy_vulns high/critical vulnerabilities"
                        issues_found=$((issues_found + trivy_vulns))
                    fi
                fi
            else
                log_error "Trivy scan failed"
                issues_found=$((issues_found + 1))
            fi
        else
            log_warning "Trivy not installed - skipping Docker vulnerability scan"
        fi
    fi
    
    # Determine scan status
    local status="passed"
    if [ $issues_found -gt 0 ]; then
        if [ $CRITICAL_ISSUES -gt 0 ]; then
            status="failed"
            log_error "Dependency scan failed due to critical vulnerabilities"
        else
            status="warning"
            log_warning "Dependency scan completed with warnings"
        fi
    else
        log_success "Dependency scan passed - no vulnerabilities found"
    fi
    
    add_scan_result "dependency_vulnerabilities" "$status" $issues_found "$details"
}

# Secret detection scanning
scan_secrets() {
    log_security "Starting secret detection scan..."
    
    local issues_found=0
    local details="{}"
    
    # TruffleHog scan
    if command -v trufflehog &> /dev/null; then
        log_info "Running TruffleHog secret scan..."
        
        if trufflehog filesystem . --json > "$REPORT_DIR/trufflehog.json" 2>/dev/null; then
            if [ -s "$REPORT_DIR/trufflehog.json" ]; then
                local secrets_count=$(wc -l < "$REPORT_DIR/trufflehog.json" || echo "0")
                if [ "$secrets_count" -gt 0 ]; then
                    log_critical "TruffleHog found $secrets_count potential secrets"
                    issues_found=$((issues_found + secrets_count))
                    details="{\"trufflehog_secrets\": $secrets_count}"
                else
                    log_success "TruffleHog found no secrets"
                fi
            else
                log_success "TruffleHog found no secrets"
            fi
        else
            log_error "TruffleHog scan failed"
            issues_found=$((issues_found + 1))
        fi
    else
        log_warning "TruffleHog not installed - using manual secret detection"
        
        # Manual secret pattern detection
        local secret_patterns=(
            "password.*=.*['\"][^'\"]{8,}"
            "secret.*=.*['\"][^'\"]{8,}"
            "key.*=.*['\"][^'\"]{16,}"
            "token.*=.*['\"][^'\"]{16,}"
            "api_key.*['\"][A-Za-z0-9_-]{16,}"
            "AKIA[0-9A-Z]{16}"  # AWS Access Key
            "sk-[A-Za-z0-9]{20,}"  # OpenAI API Key
            "xoxb-[0-9]{11}-[0-9]{11}-[A-Za-z0-9]{24}"  # Slack Bot Token
        )
        
        for pattern in "${secret_patterns[@]}"; do
            if git log --all --grep="$pattern" --oneline | head -5 | grep -q .; then
                log_critical "Potential secret pattern found in git history: $pattern"
                issues_found=$((issues_found + 1))
            fi
            
            if find . -type f -name "*.js" -o -name "*.ts" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" | xargs grep -l "$pattern" 2>/dev/null; then
                log_critical "Potential secret pattern found in files: $pattern"
                issues_found=$((issues_found + 1))
            fi
        done
    fi
    
    # Environment file security check
    if [ -f ".env" ]; then
        log_info "Checking .env file security..."
        
        # Check if .env is in .gitignore
        if [ -f ".gitignore" ] && grep -q "\.env" .gitignore; then
            log_success ".env file properly ignored in git"
        else
            log_critical ".env file not in .gitignore - potential secret exposure"
            issues_found=$((issues_found + 1))
        fi
        
        # Check for production secrets in .env
        if grep -i "production\|prod" .env; then
            log_critical "Production configuration found in .env file"
            issues_found=$((issues_found + 1))
        fi
    fi
    
    local status="passed"
    if [ $issues_found -gt 0 ]; then
        status="failed"
        log_error "Secret scan failed - $issues_found issues found"
    else
        log_success "Secret scan passed - no secrets detected"
    fi
    
    add_scan_result "secret_detection" "$status" $issues_found "$details"
}

# Container security scanning
scan_containers() {
    log_security "Starting container security scan..."
    
    local issues_found=0
    local details="{}"
    
    if [ ! -f "Dockerfile" ]; then
        log_info "No Dockerfile found - skipping container security scan"
        add_scan_result "container_security" "skipped" 0 "{}"
        return
    fi
    
    # Dockerfile best practices check
    log_info "Checking Dockerfile security best practices..."
    
    local dockerfile_issues=0
    
    # Check for running as root
    if ! grep -q "USER" Dockerfile; then
        log_warning "Dockerfile doesn't specify non-root USER"
        dockerfile_issues=$((dockerfile_issues + 1))
    fi
    
    # Check for COPY vs ADD
    if grep -q "^ADD" Dockerfile; then
        log_warning "Dockerfile uses ADD instead of COPY (potential security risk)"
        dockerfile_issues=$((dockerfile_issues + 1))
    fi
    
    # Check for --no-cache in RUN commands
    if grep "apt-get\|apk add" Dockerfile | grep -v "no-cache"; then
        log_warning "Package installation without --no-cache flag"
        dockerfile_issues=$((dockerfile_issues + 1))
    fi
    
    # Check for latest tag
    if grep -q "FROM.*:latest" Dockerfile; then
        log_warning "Dockerfile uses 'latest' tag (not reproducible)"
        dockerfile_issues=$((dockerfile_issues + 1))
    fi
    
    # Check for secrets in Dockerfile
    if grep -E "(password|secret|key|token)" Dockerfile; then
        log_critical "Potential secrets found in Dockerfile"
        dockerfile_issues=$((dockerfile_issues + 1))
        CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
    fi
    
    issues_found=$((issues_found + dockerfile_issues))
    details="{\"dockerfile_issues\": $dockerfile_issues}"
    
    # Container image vulnerability scan with Trivy
    if command -v trivy &> /dev/null; then
        log_info "Scanning container image with Trivy..."
        
        # Build image for scanning
        local image_tag="orbit-mkt-security-scan:latest"
        if docker build -t "$image_tag" . > "$REPORT_DIR/docker-build.log" 2>&1; then
            if trivy image --format json --output "$REPORT_DIR/trivy-image.json" "$image_tag"; then
                log_success "Container image scan completed"
                
                # Parse results
                if command -v jq &> /dev/null; then
                    local critical_vulns=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity == "CRITICAL")] | length' "$REPORT_DIR/trivy-image.json" 2>/dev/null || echo "0")
                    local high_vulns=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity == "HIGH")] | length' "$REPORT_DIR/trivy-image.json" 2>/dev/null || echo "0")
                    
                    if [ "$critical_vulns" -gt 0 ]; then
                        log_critical "Container image has $critical_vulns critical vulnerabilities"
                        CRITICAL_ISSUES=$((CRITICAL_ISSUES + critical_vulns))
                    fi
                    
                    if [ "$high_vulns" -gt 0 ]; then
                        log_warning "Container image has $high_vulns high vulnerabilities"
                        HIGH_ISSUES=$((HIGH_ISSUES + high_vulns))
                    fi
                    
                    issues_found=$((issues_found + critical_vulns + high_vulns))
                fi
            else
                log_error "Container image scan failed"
                issues_found=$((issues_found + 1))
            fi
            
            # Clean up test image
            docker rmi "$image_tag" > /dev/null 2>&1 || true
        else
            log_error "Failed to build container image for scanning"
            issues_found=$((issues_found + 1))
        fi
    else
        log_warning "Trivy not available - skipping container image scan"
    fi
    
    local status="passed"
    if [ $issues_found -gt 0 ]; then
        if [ $CRITICAL_ISSUES -gt 0 ]; then
            status="failed"
            log_error "Container security scan failed"
        else
            status="warning"
            log_warning "Container security scan completed with warnings"
        fi
    else
        log_success "Container security scan passed"
    fi
    
    add_scan_result "container_security" "$status" $issues_found "$details"
}

# Code security scanning (SAST)
scan_code_security() {
    log_security "Starting static code security analysis..."
    
    local issues_found=0
    local details="{}"
    
    # ESLint security plugin
    if [ -f "package.json" ] && npm list eslint-plugin-security > /dev/null 2>&1; then
        log_info "Running ESLint security scan..."
        
        if npx eslint --ext .js,.ts,.jsx,.tsx --format json . > "$REPORT_DIR/eslint-security.json" 2>/dev/null; then
            if command -v jq &> /dev/null; then
                local security_issues=$(jq '[.[] | select(.messages[] | .ruleId | test("security/"))] | length' "$REPORT_DIR/eslint-security.json" 2>/dev/null || echo "0")
                if [ "$security_issues" -gt 0 ]; then
                    log_warning "ESLint found $security_issues security issues"
                    issues_found=$((issues_found + security_issues))
                fi
            fi
            log_success "ESLint security scan completed"
        else
            log_warning "ESLint security scan encountered issues"
        fi
    else
        log_info "ESLint security plugin not installed - skipping SAST"
    fi
    
    # Semgrep security scanning
    if command -v semgrep &> /dev/null; then
        log_info "Running Semgrep security scan..."
        
        if semgrep --config=auto --json --output="$REPORT_DIR/semgrep.json" . 2>/dev/null; then
            if command -v jq &> /dev/null; then
                local semgrep_issues=$(jq '.results | length' "$REPORT_DIR/semgrep.json" 2>/dev/null || echo "0")
                if [ "$semgrep_issues" -gt 0 ]; then
                    log_warning "Semgrep found $semgrep_issues security issues"
                    issues_found=$((issues_found + semgrep_issues))
                fi
            fi
            log_success "Semgrep security scan completed"
        else
            log_warning "Semgrep scan failed"
        fi
    fi
    
    # Manual security pattern checking
    log_info "Checking for common security anti-patterns..."
    
    local security_patterns=(
        "eval\s*\("
        "innerHTML\s*="
        "document\.write"
        "dangerouslySetInnerHTML"
        "exec\s*\("
        "system\s*\("
        "shell_exec"
        "mysql_query.*\$_"
        "console\.log.*password"
        "console\.log.*secret"
    )
    
    for pattern in "${security_patterns[@]}"; do
        if find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) -exec grep -l "$pattern" {} \; 2>/dev/null | head -1; then
            log_warning "Potential security anti-pattern found: $pattern"
            issues_found=$((issues_found + 1))
        fi
    done
    
    local status="passed"
    if [ $issues_found -gt 0 ]; then
        status="warning"
        log_warning "Code security scan completed with $issues_found issues"
    else
        log_success "Code security scan passed"
    fi
    
    add_scan_result "code_security" "$status" $issues_found "$details"
}

# Compliance checking
scan_compliance() {
    log_security "Starting compliance checks..."
    
    local issues_found=0
    local compliance_score=100
    local details="{}"
    
    # License compliance
    log_info "Checking license compliance..."
    
    if [ -f "package.json" ]; then
        if command -v license-checker &> /dev/null; then
            license-checker --summary > "$REPORT_DIR/licenses.txt" 2>&1
            
            # Check for problematic licenses
            local problematic_licenses=("GPL" "AGPL" "LGPL" "CC-BY-SA")
            for license in "${problematic_licenses[@]}"; do
                if grep -i "$license" "$REPORT_DIR/licenses.txt"; then
                    log_warning "Potentially problematic license found: $license"
                    issues_found=$((issues_found + 1))
                    compliance_score=$((compliance_score - 10))
                fi
            done
        fi
    fi
    
    # Privacy compliance (GDPR, CCPA)
    log_info "Checking privacy compliance indicators..."
    
    local privacy_indicators=("cookie" "tracking" "analytics" "personal.*data" "user.*data")
    local privacy_files_found=0
    
    for indicator in "${privacy_indicators[@]}"; do
        if find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) -exec grep -l "$indicator" {} \; 2>/dev/null | head -1; then
            privacy_files_found=$((privacy_files_found + 1))
        fi
    done
    
    if [ $privacy_files_found -gt 0 ]; then
        # Check for privacy policy
        if ! find . -type f -name "*privacy*" -o -name "*gdpr*" -o -name "*ccpa*" | head -1; then
            log_warning "Data processing detected but no privacy policy files found"
            issues_found=$((issues_found + 1))
            compliance_score=$((compliance_score - 20))
        fi
        
        # Check for consent management
        if ! find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) -exec grep -l "consent\|opt-out" {} \; 2>/dev/null | head -1; then
            log_warning "Data processing detected but no consent management found"
            issues_found=$((issues_found + 1))
            compliance_score=$((compliance_score - 15))
        fi
    fi
    
    # Security headers compliance
    log_info "Checking security headers compliance..."
    
    if [ -f "server.js" ] || [ -f "app.js" ] || find . -name "*.js" -exec grep -l "express\|fastify\|koa" {} \; 2>/dev/null | head -1; then
        # Check for security headers middleware
        if ! find . -name "*.js" -exec grep -l "helmet\|cors\|csp" {} \; 2>/dev/null | head -1; then
            log_warning "Web server detected but no security headers middleware found"
            issues_found=$((issues_found + 1))
            compliance_score=$((compliance_score - 25))
        fi
    fi
    
    # Accessibility compliance (WCAG)
    log_info "Checking accessibility compliance indicators..."
    
    if find . -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.html" \) | head -1; then
        # Check for accessibility attributes
        local a11y_indicators=("aria-" "alt=" "role=" "tabindex" "aria-label")
        local a11y_found=0
        
        for indicator in "${a11y_indicators[@]}"; do
            if find . -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.html" \) -exec grep -l "$indicator" {} \; 2>/dev/null | head -1; then
                a11y_found=1
                break
            fi
        done
        
        if [ $a11y_found -eq 0 ]; then
            log_warning "UI components found but no accessibility attributes detected"
            issues_found=$((issues_found + 1))
            compliance_score=$((compliance_score - 15))
        fi
    fi
    
    # Update details
    details="{\"compliance_score\": $compliance_score, \"privacy_files\": $privacy_files_found}"
    
    local status="passed"
    if [ $compliance_score -lt 70 ]; then
        status="failed"
        log_error "Compliance score too low: $compliance_score%"
    elif [ $compliance_score -lt 85 ]; then
        status="warning"
        log_warning "Compliance score acceptable but could be improved: $compliance_score%"
    else
        log_success "Compliance check passed with score: $compliance_score%"
    fi
    
    add_scan_result "compliance" "$status" $issues_found "$details"
}

# Infrastructure security check
scan_infrastructure() {
    log_security "Starting infrastructure security checks..."
    
    local issues_found=0
    local details="{}"
    
    # Kubernetes security if manifests exist
    if find . -name "*.yaml" -o -name "*.yml" | grep -E "(k8s|kubernetes|deploy)" | head -1; then
        log_info "Checking Kubernetes security..."
        
        local k8s_issues=0
        
        # Check for security contexts
        if ! find . -name "*.yaml" -o -name "*.yml" -exec grep -l "securityContext" {} \; 2>/dev/null | head -1; then
            log_warning "Kubernetes manifests found but no securityContext specified"
            k8s_issues=$((k8s_issues + 1))
        fi
        
        # Check for resource limits
        if ! find . -name "*.yaml" -o -name "*.yml" -exec grep -l "resources:" {} \; 2>/dev/null | head -1; then
            log_warning "Kubernetes manifests found but no resource limits specified"
            k8s_issues=$((k8s_issues + 1))
        fi
        
        # Check for privileged containers
        if find . -name "*.yaml" -o -name "*.yml" -exec grep -l "privileged.*true" {} \; 2>/dev/null | head -1; then
            log_critical "Privileged containers detected in Kubernetes manifests"
            k8s_issues=$((k8s_issues + 1))
            CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
        fi
        
        issues_found=$((issues_found + k8s_issues))
        details="{\"kubernetes_issues\": $k8s_issues}"
    fi
    
    # Docker Compose security
    if [ -f "docker-compose.yml" ] || [ -f "docker-compose.yaml" ]; then
        log_info "Checking Docker Compose security..."
        
        # Check for privileged mode
        if grep -q "privileged.*true" docker-compose.y*ml; then
            log_critical "Privileged mode detected in Docker Compose"
            issues_found=$((issues_found + 1))
            CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
        fi
        
        # Check for host network mode
        if grep -q "network_mode.*host" docker-compose.y*ml; then
            log_warning "Host network mode detected in Docker Compose"
            issues_found=$((issues_found + 1))
        fi
    fi
    
    local status="passed"
    if [ $issues_found -gt 0 ]; then
        if [ $CRITICAL_ISSUES -gt 0 ]; then
            status="failed"
            log_error "Infrastructure security scan failed"
        else
            status="warning"
            log_warning "Infrastructure security scan completed with warnings"
        fi
    else
        log_success "Infrastructure security scan passed"
    fi
    
    add_scan_result "infrastructure_security" "$status" $issues_found "$details"
}

# Generate final security report
generate_security_report() {
    log_info "Generating final security report..."
    
    # Update summary in JSON report
    if command -v jq &> /dev/null; then
        jq ".summary.total = $TOTAL_SCANS | .summary.passed = $PASSED_SCANS | .summary.failed = $FAILED_SCANS | .summary.warnings = $WARNING_SCANS | .summary.issues.critical = $CRITICAL_ISSUES | .summary.issues.high = $HIGH_ISSUES | .summary.issues.medium = $MEDIUM_ISSUES | .summary.issues.low = $LOW_ISSUES" "$SECURITY_REPORT" > "/tmp/final_report.json"
        mv "/tmp/final_report.json" "$SECURITY_REPORT"
    fi
    
    # Generate human-readable report
    local text_report="$REPORT_DIR/security-report.txt"
    
    cat > "$text_report" << EOF
=====================================
ORBIT MKT SECURITY SCAN REPORT
=====================================
Scan ID: $SCAN_ID
Environment: $ENVIRONMENT
Timestamp: $(date '+%Y-%m-%d %H:%M:%S')
Scan Type: $SCAN_TYPE
Severity Threshold: $SEVERITY_THRESHOLD
=====================================

SUMMARY:
Total Scans: $TOTAL_SCANS
Passed: $PASSED_SCANS
Failed: $FAILED_SCANS  
Warnings: $WARNING_SCANS

SECURITY ISSUES BY SEVERITY:
Critical: $CRITICAL_ISSUES
High: $HIGH_ISSUES
Medium: $MEDIUM_ISSUES
Low: $LOW_ISSUES

OVERALL RISK ASSESSMENT:
EOF

    # Risk assessment
    local risk_level="LOW"
    if [ $CRITICAL_ISSUES -gt 0 ]; then
        risk_level="CRITICAL"
    elif [ $HIGH_ISSUES -gt 5 ]; then
        risk_level="HIGH"
    elif [ $HIGH_ISSUES -gt 0 ] || [ $MEDIUM_ISSUES -gt 10 ]; then
        risk_level="MEDIUM"
    fi
    
    echo "Risk Level: $risk_level" >> "$text_report"
    echo "" >> "$text_report"
    
    # Recommendations
    cat >> "$text_report" << EOF
RECOMMENDATIONS:
- Address all CRITICAL issues before deployment
- Review and fix HIGH severity issues
- Consider fixing MEDIUM severity issues for improved security posture
- Regular security scans should be performed

REPORT LOCATION:
JSON Report: $SECURITY_REPORT
Text Report: $text_report
Scan Data: $REPORT_DIR/
=====================================
EOF
    
    log_success "Security reports generated:"
    log_success "  JSON: $SECURITY_REPORT"
    log_success "  Text: $text_report"
    
    # Display summary
    echo ""
    echo "=================================="
    echo "SECURITY SCAN SUMMARY"
    echo "=================================="
    echo "Risk Level: $risk_level"
    echo "Total Issues: $((CRITICAL_ISSUES + HIGH_ISSUES + MEDIUM_ISSUES + LOW_ISSUES))"
    echo "  Critical: $CRITICAL_ISSUES"
    echo "  High: $HIGH_ISSUES"
    echo "  Medium: $MEDIUM_ISSUES"
    echo "  Low: $LOW_ISSUES"
    echo "=================================="
    
    # Return appropriate exit code
    if [ "$risk_level" = "CRITICAL" ] && [ "$FAIL_ON_CRITICAL" = "true" ]; then
        return 1
    elif [ "$risk_level" = "HIGH" ] && [ "$SEVERITY_THRESHOLD" = "high" ]; then
        return 1
    elif [ "$risk_level" = "MEDIUM" ] && [ "$SEVERITY_THRESHOLD" = "medium" ]; then
        return 1
    else
        return 0
    fi
}

# Main security scanning execution
main() {
    log_security "Starting comprehensive security scan for Orbit MKT"
    log_security "Scan ID: $SCAN_ID"
    log_security "Environment: $ENVIRONMENT"
    log_security "Scan Type: $SCAN_TYPE"
    log_security "Severity Threshold: $SEVERITY_THRESHOLD"
    log_security "=================================================="
    
    # Initialize report
    init_security_report
    
    # Run scans based on scan type
    case "$SCAN_TYPE" in
        "all")
            scan_dependencies
            scan_secrets
            scan_containers
            scan_code_security
            scan_compliance
            scan_infrastructure
            ;;
        "dependencies")
            scan_dependencies
            ;;
        "secrets")
            scan_secrets
            ;;
        "containers")
            scan_containers
            ;;
        "compliance")
            scan_compliance
            ;;
        *)
            log_error "Invalid scan type: $SCAN_TYPE"
            exit 1
            ;;
    esac
    
    # Generate final report
    if generate_security_report; then
        log_security "=================================================="
        log_security "Security scan completed successfully!"
        log_security "All security checks passed or within acceptable limits"
        log_security "=================================================="
        exit 0
    else
        log_security "=================================================="
        log_security "Security scan failed!"
        log_security "Critical security issues found - deployment blocked"
        log_security "=================================================="
        exit 1
    fi
}

# Execute main function
main "$@"