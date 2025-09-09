# 🚀 CI/CD Pipeline Setup Guide

## 📋 Overview

This project includes a comprehensive CI/CD pipeline using GitHub Actions that handles:
- ✅ **Code quality checks** (linting, TypeScript)
- ✅ **Security scanning** (npm audit, dependency checking)
- ✅ **Comprehensive testing** (unit, integration, accessibility)
- ✅ **Automated building** (frontend + backend)
- ✅ **Bundle analysis** (size tracking, performance)
- ✅ **Multi-environment deployment** (staging, production)
- ✅ **Performance monitoring** (Lighthouse audits)

## 🔧 Pipeline Configuration

### **Workflow Files**
- `.github/workflows/ci.yml` - Main CI/CD pipeline
- `.lighthouserc.json` - Lighthouse configuration for performance/accessibility testing

### **Triggered By**
- **Push** to `main` or `develop` branches
- **Pull requests** to `main` or `develop` branches
- **Manual dispatch** (for testing)

## 🏗️ Pipeline Stages

### **1. Code Quality (Lint)**
```yaml
- ESLint checking
- TypeScript compilation
- Code formatting verification
```

### **2. Security Scanning**
```yaml
- npm audit for vulnerabilities
- Dependency security scan
- SARIF report generation
```

### **3. Testing**
```yaml
- Unit tests (Jest + React Testing Library)
- Backend API tests
- Cross-platform testing (Node 18, 20)
- Coverage reporting to Codecov
```

### **4. Build & Analysis**
```yaml
- Production build generation
- Bundle size analysis
- Build artifact upload
- Performance optimization checks
```

### **5. Accessibility Testing**
```yaml
- Lighthouse accessibility audit
- WCAG 2.1 compliance verification
- Screen reader compatibility
```

### **6. Integration Testing**
```yaml
- Full-stack integration tests
- API endpoint testing
- End-to-end user workflows
```

### **7. Deployment**
```yaml
- Staging (develop branch)
- Production (main branch)
- Environment-specific configuration
- Team notifications
```

### **8. Performance Monitoring**
```yaml
- Post-deployment Lighthouse audit
- Performance regression detection
- Core Web Vitals tracking
```

## ⚙️ Environment Setup

### **Required GitHub Secrets**

#### **General Secrets**
```bash
GITHUB_TOKEN          # Automatically provided by GitHub
CODECOV_TOKEN         # For code coverage reporting (optional)
```

#### **Slack Notifications (Optional)**
```bash
SLACK_WEBHOOK         # Webhook URL for deployment notifications
```

#### **Production Deployment**
```bash
PRODUCTION_API_KEY    # Production API keys
PRODUCTION_DB_URL     # Production database connection
```

#### **Staging Environment**
```bash
STAGING_API_KEY       # Staging API keys
STAGING_DB_URL        # Staging database connection
```

### **Environment Variables**

#### **Frontend (.env.production)**
```bash
VITE_BACKEND_URL=https://api.orbit-marketing.com
VITE_APP_NAME=Orbit Marketing
VITE_SENTRY_DSN=https://your-sentry-dsn
```

#### **Backend (.env.production)**
```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
GEMINI_API_KEY=${GEMINI_API_KEY}
DATABASE_URL=${DATABASE_URL}
```

## 🎯 Quality Gates

### **Build Requirements**
- ✅ All linting rules pass
- ✅ TypeScript compilation successful
- ✅ No high-severity security vulnerabilities
- ✅ Test coverage > 70%
- ✅ Build completes without errors

### **Deployment Requirements**
- ✅ All tests pass (unit + integration)
- ✅ Accessibility score > 95%
- ✅ Performance score > 80%
- ✅ Bundle size within limits
- ✅ Security audit clean

### **Performance Thresholds**
```json
{
  "performance": "> 80%",
  "accessibility": "> 95%",
  "best-practices": "> 90%",
  "seo": "> 80%",
  "bundle-size": "< 500KB (gzipped)"
}
```

## 🚀 Deployment Process

### **Staging Deployment (develop branch)**
1. Push/merge to `develop` branch
2. Pipeline runs all checks
3. On success, deploys to staging environment
4. Staging URL: `https://staging.orbit-marketing.com`
5. Team notification sent

### **Production Deployment (main branch)**
1. Push/merge to `main` branch (usually via PR from develop)
2. Full pipeline execution (all stages)
3. Accessibility and performance audits
4. On success, deploys to production
5. Production URL: `https://orbit-marketing.com`
6. Performance monitoring initiated

### **Rollback Process**
```bash
# If deployment fails or issues detected
git revert HEAD~1  # Revert last commit
git push origin main  # Triggers new deployment with rollback
```

## 📊 Monitoring & Alerts

### **GitHub Actions Monitoring**
- Pipeline status badges in README
- Workflow run history and logs
- Artifact storage and management
- Performance trend tracking

### **Slack Integration**
```yaml
# Deployment notifications
- Successful deployments
- Failed deployments with error details
- Performance regression alerts
- Security vulnerability alerts
```

### **Performance Monitoring**
- Lighthouse CI integration
- Core Web Vitals tracking
- Bundle size monitoring
- Performance regression detection

## 🔧 Local Development Workflow

### **Running Tests Locally**
```bash
# Frontend tests
npm test

# Backend tests
cd server && npm test

# Integration tests
npm run test:integration

# Accessibility tests
npm run lighthouse
```

### **Build Testing**
```bash
# Test production build
npm run build
npm run preview

# Analyze bundle
npm run analyze
```

### **Pre-commit Checks**
```bash
# Manual quality checks before committing
npm run lint
npm run typecheck
npm test
npm run build
```

## 🔍 Troubleshooting

### **Common Pipeline Issues**

#### **Tests Failing**
```bash
# Check test logs in GitHub Actions
# Run tests locally to reproduce
npm test -- --verbose

# Check for environment differences
# Verify dependencies are up to date
```

#### **Build Failures**
```bash
# Check TypeScript errors
npm run typecheck

# Verify environment variables
# Check for missing dependencies
npm ci
```

#### **Deployment Issues**
```bash
# Check deployment logs
# Verify environment secrets
# Test build artifacts locally
```

#### **Performance Regressions**
```bash
# Check Lighthouse report details
# Compare bundle sizes over time
# Identify heavy dependencies
npm run analyze
```

### **Pipeline Debugging**

#### **Enable Debug Logging**
```yaml
# Add to workflow file
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

#### **Manual Workflow Testing**
```bash
# Trigger workflow manually
gh workflow run ci.yml

# Check workflow status
gh workflow list
gh run list
```

## 📈 Optimization Tips

### **Faster Builds**
- Use dependency caching
- Parallel job execution
- Artifact reuse between jobs
- Conditional job execution

### **Cost Optimization**
- Use matrix builds efficiently
- Cache node_modules properly
- Limit artifact retention
- Skip unnecessary jobs on documentation changes

### **Security Best Practices**
- Limit secret access to necessary jobs
- Use least-privilege permissions
- Regularly rotate secrets
- Monitor dependency vulnerabilities

## 🔄 Workflow Customization

### **Adding New Environments**
1. Create environment in GitHub Settings
2. Add environment-specific secrets
3. Create deployment job in workflow
4. Configure environment protection rules

### **Adding Custom Tests**
```yaml
# Add new job to ci.yml
custom-tests:
  name: 🧪 Custom Tests
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Run custom tests
      run: npm run test:custom
```

### **Integration with External Services**
```yaml
# Example: Deploy to AWS
- name: Deploy to AWS
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## 📋 Maintenance Checklist

### **Weekly**
- [ ] Review failed workflow runs
- [ ] Check dependency vulnerability reports
- [ ] Monitor performance trends
- [ ] Update secrets if needed

### **Monthly**
- [ ] Update GitHub Actions versions
- [ ] Review and optimize workflow performance
- [ ] Check artifact storage usage
- [ ] Update documentation

### **Quarterly**
- [ ] Review security policies
- [ ] Update performance thresholds
- [ ] Audit secret access
- [ ] Plan workflow improvements

---

## 🎓 Best Practices Summary

1. **Keep workflows fast** - Use caching and parallel execution
2. **Fail fast** - Put quick checks first to catch issues early
3. **Be specific** - Use precise job names and clear error messages
4. **Document changes** - Update this guide when modifying workflows
5. **Test locally** - Reproduce pipeline steps locally when possible
6. **Monitor performance** - Track build times and success rates
7. **Secure by default** - Follow security best practices for secrets and permissions

---

🚀 **Your CI/CD pipeline is now ready for production!** The automated workflow will ensure code quality, security, and performance with every deployment.