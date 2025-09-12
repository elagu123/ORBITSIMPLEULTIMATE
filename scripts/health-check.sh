#!/bin/bash
set -euo pipefail

# Comprehensive Health Check Script for Orbit MKT
# Validates application health across multiple dimensions

ENVIRONMENT=${1:-staging}
BASE_URL=${2:-https://staging.orbit.com}
TIMEOUT=${3:-30}
MAX_RETRIES=${4:-10}
RETRY_INTERVAL=${5:-5}

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${BLUE}[HEALTH-CHECK]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
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

# Health check results
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0
HEALTH_REPORT=""

# Add result to report
add_result() {
    local status=$1
    local check_name=$2
    local message=$3
    local response_time=${4:-"N/A"}
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    case $status in
        "PASS")
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
            log_success "$check_name: $message (${response_time}ms)"
            ;;
        "FAIL")
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            log_error "$check_name: $message (${response_time}ms)"
            ;;
        "WARN")
            WARNING_CHECKS=$((WARNING_CHECKS + 1))
            log_warning "$check_name: $message (${response_time}ms)"
            ;;
    esac
    
    HEALTH_REPORT+="\n$status,$check_name,$message,$response_time"
}

# HTTP health check with retry logic
http_check() {
    local endpoint=$1
    local expected_status=${2:-200}
    local check_name=$3
    local max_response_time=${4:-5000}
    
    log_info "Checking $check_name: $endpoint"
    
    for attempt in $(seq 1 $MAX_RETRIES); do
        # Measure response time
        local start_time=$(date +%s%3N)
        
        # Make HTTP request with timeout
        local response=$(curl -s -w "%{http_code}|%{time_total}" -m $TIMEOUT "$endpoint" 2>/dev/null || echo "000|0")
        
        local end_time=$(date +%s%3N)
        local response_time=$((end_time - start_time))
        
        local status_code=$(echo "$response" | cut -d'|' -f1)
        local curl_time=$(echo "$response" | cut -d'|' -f2)
        
        # Convert curl time to milliseconds
        local curl_time_ms=$(echo "$curl_time * 1000" | bc -l 2>/dev/null | cut -d'.' -f1 || echo "0")
        
        if [ "$status_code" = "$expected_status" ]; then
            if [ "$response_time" -le "$max_response_time" ]; then
                add_result "PASS" "$check_name" "HTTP $status_code received" "$response_time"
                return 0
            else
                add_result "WARN" "$check_name" "HTTP $status_code but slow response" "$response_time"
                return 0
            fi
        else
            if [ $attempt -eq $MAX_RETRIES ]; then
                add_result "FAIL" "$check_name" "HTTP $status_code (expected $expected_status)" "$response_time"
                return 1
            else
                log_warning "$check_name attempt $attempt failed (HTTP $status_code), retrying..."
                sleep $RETRY_INTERVAL
            fi
        fi
    done
}

# JSON API health check
api_health_check() {
    local endpoint="$BASE_URL/api/health"
    local check_name="API Health Endpoint"
    
    log_info "Checking $check_name: $endpoint"
    
    local response=$(curl -s -m $TIMEOUT -H "Accept: application/json" "$endpoint" 2>/dev/null || echo '{}')
    local status_code=$(curl -s -w "%{http_code}" -m $TIMEOUT -H "Accept: application/json" "$endpoint" -o /dev/null 2>/dev/null || echo "000")
    
    if [ "$status_code" = "200" ]; then
        # Parse JSON response
        local api_status=$(echo "$response" | jq -r '.status // "unknown"' 2>/dev/null || echo "unknown")
        local api_version=$(echo "$response" | jq -r '.version // "unknown"' 2>/dev/null || echo "unknown")
        local database_status=$(echo "$response" | jq -r '.database // "unknown"' 2>/dev/null || echo "unknown")
        
        if [ "$api_status" = "healthy" ]; then
            add_result "PASS" "$check_name" "API healthy (v$api_version, DB: $database_status)"
        else
            add_result "FAIL" "$check_name" "API status: $api_status (v$api_version, DB: $database_status)"
        fi
    else
        add_result "FAIL" "$check_name" "HTTP $status_code"
    fi
}

# Database connectivity check
database_check() {
    local endpoint="$BASE_URL/api/health/database"
    local check_name="Database Connectivity"
    
    log_info "Checking $check_name: $endpoint"
    
    local response=$(curl -s -m $TIMEOUT "$endpoint" 2>/dev/null || echo '{}')
    local status_code=$(curl -s -w "%{http_code}" -m $TIMEOUT "$endpoint" -o /dev/null 2>/dev/null || echo "000")
    
    if [ "$status_code" = "200" ]; then
        local db_status=$(echo "$response" | jq -r '.status // "unknown"' 2>/dev/null || echo "unknown")
        local response_time=$(echo "$response" | jq -r '.responseTime // "0"' 2>/dev/null || echo "0")
        
        if [ "$db_status" = "connected" ]; then
            if [ "${response_time%.*}" -lt 100 ]; then
                add_result "PASS" "$check_name" "Database connected" "$response_time"
            else
                add_result "WARN" "$check_name" "Database connected but slow" "$response_time"
            fi
        else
            add_result "FAIL" "$check_name" "Database status: $db_status" "$response_time"
        fi
    else
        add_result "FAIL" "$check_name" "HTTP $status_code"
    fi
}

# Memory and CPU usage check
resource_usage_check() {
    local endpoint="$BASE_URL/api/health/resources"
    local check_name="Resource Usage"
    
    log_info "Checking $check_name: $endpoint"
    
    local response=$(curl -s -m $TIMEOUT "$endpoint" 2>/dev/null || echo '{}')
    local status_code=$(curl -s -w "%{http_code}" -m $TIMEOUT "$endpoint" -o /dev/null 2>/dev/null || echo "000")
    
    if [ "$status_code" = "200" ]; then
        local memory_usage=$(echo "$response" | jq -r '.memoryUsage // "0"' 2>/dev/null || echo "0")
        local cpu_usage=$(echo "$response" | jq -r '.cpuUsage // "0"' 2>/dev/null || echo "0")
        
        # Convert to integers for comparison
        local memory_pct=$(echo "$memory_usage" | cut -d'.' -f1)
        local cpu_pct=$(echo "$cpu_usage" | cut -d'.' -f1)
        
        if [ "$memory_pct" -lt 80 ] && [ "$cpu_pct" -lt 80 ]; then
            add_result "PASS" "$check_name" "Memory: ${memory_usage}%, CPU: ${cpu_usage}%"
        elif [ "$memory_pct" -lt 90 ] && [ "$cpu_pct" -lt 90 ]; then
            add_result "WARN" "$check_name" "Memory: ${memory_usage}%, CPU: ${cpu_usage}% (high)"
        else
            add_result "FAIL" "$check_name" "Memory: ${memory_usage}%, CPU: ${cpu_usage}% (critical)"
        fi
    else
        add_result "WARN" "$check_name" "Resource monitoring unavailable (HTTP $status_code)"
    fi
}

# Authentication system check
auth_check() {
    local login_endpoint="$BASE_URL/auth/health"
    local check_name="Authentication System"
    
    log_info "Checking $check_name: $login_endpoint"
    
    local response=$(curl -s -m $TIMEOUT "$login_endpoint" 2>/dev/null || echo '{}')
    local status_code=$(curl -s -w "%{http_code}" -m $TIMEOUT "$login_endpoint" -o /dev/null 2>/dev/null || echo "000")
    
    if [ "$status_code" = "200" ]; then
        local auth_status=$(echo "$response" | jq -r '.status // "unknown"' 2>/dev/null || echo "unknown")
        
        if [ "$auth_status" = "operational" ]; then
            add_result "PASS" "$check_name" "Authentication system operational"
        else
            add_result "FAIL" "$check_name" "Authentication status: $auth_status"
        fi
    else
        add_result "FAIL" "$check_name" "HTTP $status_code"
    fi
}

# External dependencies check
dependencies_check() {
    local deps_endpoint="$BASE_URL/api/health/dependencies"
    local check_name="External Dependencies"
    
    log_info "Checking $check_name: $deps_endpoint"
    
    local response=$(curl -s -m $TIMEOUT "$deps_endpoint" 2>/dev/null || echo '{}')
    local status_code=$(curl -s -w "%{http_code}" -m $TIMEOUT "$deps_endpoint" -o /dev/null 2>/dev/null || echo "000")
    
    if [ "$status_code" = "200" ]; then
        local deps_status=$(echo "$response" | jq -r '.status // "unknown"' 2>/dev/null || echo "unknown")
        local failed_deps=$(echo "$response" | jq -r '.failedDependencies // []' 2>/dev/null | jq -r 'length' 2>/dev/null || echo "0")
        
        if [ "$failed_deps" = "0" ]; then
            add_result "PASS" "$check_name" "All external dependencies healthy"
        else
            add_result "WARN" "$check_name" "$failed_deps dependencies failing"
        fi
    else
        add_result "WARN" "$check_name" "Dependency monitoring unavailable (HTTP $status_code)"
    fi
}

# SSL certificate check
ssl_check() {
    local domain=$(echo "$BASE_URL" | sed 's|https\?://||' | cut -d'/' -f1)
    local check_name="SSL Certificate"
    
    if [[ $BASE_URL != https://* ]]; then
        add_result "WARN" "$check_name" "HTTPS not enabled"
        return
    fi
    
    log_info "Checking $check_name for domain: $domain"
    
    # Check SSL certificate expiration
    local cert_info=$(echo | timeout $TIMEOUT openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "")
    
    if [ -n "$cert_info" ]; then
        local expire_date=$(echo "$cert_info" | grep "notAfter" | cut -d'=' -f2)
        local expire_epoch=$(date -d "$expire_date" +%s 2>/dev/null || echo "0")
        local current_epoch=$(date +%s)
        local days_until_expire=$(( (expire_epoch - current_epoch) / 86400 ))
        
        if [ "$days_until_expire" -gt 30 ]; then
            add_result "PASS" "$check_name" "Valid for $days_until_expire more days"
        elif [ "$days_until_expire" -gt 7 ]; then
            add_result "WARN" "$check_name" "Expires in $days_until_expire days"
        else
            add_result "FAIL" "$check_name" "Expires in $days_until_expire days (critical)"
        fi
    else
        add_result "FAIL" "$check_name" "Unable to retrieve certificate information"
    fi
}

# Performance check
performance_check() {
    local check_name="Performance Metrics"
    
    log_info "Checking $check_name"
    
    # Test main page load time
    local start_time=$(date +%s%3N)
    local status_code=$(curl -s -w "%{http_code}" -m $TIMEOUT "$BASE_URL" -o /dev/null 2>/dev/null || echo "000")
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))
    
    if [ "$status_code" = "200" ]; then
        if [ "$response_time" -lt 2000 ]; then
            add_result "PASS" "$check_name" "Page load time acceptable" "$response_time"
        elif [ "$response_time" -lt 5000 ]; then
            add_result "WARN" "$check_name" "Page load time slow" "$response_time"
        else
            add_result "FAIL" "$check_name" "Page load time critical" "$response_time"
        fi
    else
        add_result "FAIL" "$check_name" "HTTP $status_code" "$response_time"
    fi
}

# Generate health report
generate_report() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local success_rate=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
    
    echo ""
    echo "=================================="
    echo "ORBIT MKT HEALTH CHECK REPORT"
    echo "=================================="
    echo "Environment: $ENVIRONMENT"
    echo "Base URL: $BASE_URL"
    echo "Timestamp: $timestamp"
    echo "=================================="
    echo "Total Checks: $TOTAL_CHECKS"
    echo "Passed: $PASSED_CHECKS"
    echo "Failed: $FAILED_CHECKS"
    echo "Warnings: $WARNING_CHECKS"
    echo "Success Rate: $success_rate%"
    echo "=================================="
    
    # Detailed results
    if [ $FAILED_CHECKS -gt 0 ]; then
        echo ""
        echo "FAILED CHECKS:"
        echo "$HEALTH_REPORT" | grep "^FAIL" | while IFS=',' read -r status check message response_time; do
            echo "  ❌ $check: $message (${response_time}ms)"
        done
    fi
    
    if [ $WARNING_CHECKS -gt 0 ]; then
        echo ""
        echo "WARNING CHECKS:"
        echo "$HEALTH_REPORT" | grep "^WARN" | while IFS=',' read -r status check message response_time; do
            echo "  ⚠️  $check: $message (${response_time}ms)"
        done
    fi
    
    echo ""
    echo "PASSED CHECKS:"
    echo "$HEALTH_REPORT" | grep "^PASS" | while IFS=',' read -r status check message response_time; do
        echo "  ✅ $check: $message (${response_time}ms)"
    done
    
    echo "=================================="
    
    # Overall health determination
    if [ $FAILED_CHECKS -eq 0 ]; then
        if [ $WARNING_CHECKS -eq 0 ]; then
            echo "🟢 OVERALL STATUS: HEALTHY"
            return 0
        else
            echo "🟡 OVERALL STATUS: DEGRADED (warnings present)"
            return 1
        fi
    else
        echo "🔴 OVERALL STATUS: UNHEALTHY"
        return 2
    fi
}

# Main health check execution
main() {
    log_info "Starting comprehensive health check for Orbit MKT"
    log_info "Environment: $ENVIRONMENT"
    log_info "Base URL: $BASE_URL"
    log_info "Timeout: ${TIMEOUT}s"
    log_info "Max Retries: $MAX_RETRIES"
    log_info "=================================================="
    
    # Core health checks
    http_check "$BASE_URL" 200 "Main Application"
    http_check "$BASE_URL/health" 200 "Health Endpoint"
    api_health_check
    database_check
    resource_usage_check
    auth_check
    dependencies_check
    ssl_check
    performance_check
    
    # Additional environment-specific checks
    if [ "$ENVIRONMENT" = "production" ]; then
        http_check "$BASE_URL/robots.txt" 200 "Robots.txt"
        http_check "$BASE_URL/sitemap.xml" 200 "Sitemap"
    fi
    
    # Generate and display report
    generate_report
}

# Execute main function
main "$@"