/*
 * Comprehensive Load Testing Script for Orbit MKT
 * Using K6 for performance testing with realistic user scenarios
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Custom metrics
export let errorRate = new Rate('errors');
export let contentGenerationTime = new Trend('content_generation_time');
export let authenticationTime = new Trend('authentication_time');
export let pageLoadTime = new Trend('page_load_time');
export let failedLogins = new Counter('failed_logins');
export let successfulConversions = new Counter('successful_conversions');

// Test configuration
export let options = {
  stages: [
    // Warm-up
    { duration: '2m', target: 10 },
    // Ramp up to normal load
    { duration: '5m', target: 50 },
    // Stay at normal load
    { duration: '10m', target: 50 },
    // Ramp up to high load
    { duration: '5m', target: 100 },
    // Stay at high load
    { duration: '10m', target: 100 },
    // Peak load
    { duration: '5m', target: 200 },
    // Stay at peak load
    { duration: '5m', target: 200 },
    // Ramp down
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    // System should handle 95% of requests within 2 seconds
    http_req_duration: ['p(95)<2000'],
    // Error rate should be below 1%
    errors: ['rate<0.01'],
    // Authentication should be fast
    authentication_time: ['p(95)<1000'],
    // Content generation should complete within 10 seconds
    content_generation_time: ['p(95)<10000'],
    // Page load times should be acceptable
    page_load_time: ['p(95)<3000'],
  },
  noConnectionReuse: false,
  userAgent: 'K6LoadTest/1.0 (Orbit MKT Performance Testing)',
};

// Test data
const BASE_URL = __ENV.TARGET_URL || 'https://staging.orbit.com';
const API_BASE_URL = `${BASE_URL}/api`;

// User personas and test data
const testUsers = [
  { email: 'test1@example.com', password: 'TestPass123!', type: 'marketer' },
  { email: 'test2@example.com', password: 'TestPass123!', type: 'business_owner' },
  { email: 'test3@example.com', password: 'TestPass123!', type: 'content_creator' },
];

const contentPrompts = [
  'Create a social media post about our new product launch for tech-savvy millennials',
  'Generate an engaging Facebook post about sustainable business practices',
  'Write an Instagram caption for our behind-the-scenes company culture',
  'Create a LinkedIn post about industry trends and insights',
  'Generate a Twitter thread about customer success stories',
];

// Utility functions
function randomUser() {
  return testUsers[Math.floor(Math.random() * testUsers.length)];
}

function randomPrompt() {
  return contentPrompts[Math.floor(Math.random() * contentPrompts.length)];
}

function setupSession() {
  // Set common headers
  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': options.userAgent,
    },
  };
}

// Test scenarios
export default function () {
  let session = setupSession();
  let user = randomUser();
  
  // Simulate different user journeys based on personas
  switch (user.type) {
    case 'marketer':
      marketerJourney(session, user);
      break;
    case 'business_owner':
      businessOwnerJourney(session, user);
      break;
    case 'content_creator':
      contentCreatorJourney(session, user);
      break;
    default:
      casualUserJourney(session, user);
  }
  
  // Random sleep between 1-5 seconds to simulate user reading/thinking time
  sleep(Math.random() * 4 + 1);
}

// Marketer user journey - focuses on analytics and campaign management
function marketerJourney(session, user) {
  group('Marketer Journey', function () {
    // Landing page
    group('Landing Page Visit', function () {
      let startTime = new Date().getTime();
      let response = http.get(BASE_URL, session);
      let endTime = new Date().getTime();
      
      pageLoadTime.add(endTime - startTime);
      
      check(response, {
        'landing page status is 200': (r) => r.status === 200,
        'landing page contains title': (r) => r.body.includes('Orbit MKT'),
      });
      
      errorRate.add(response.status >= 400);
    });
    
    sleep(2);
    
    // Authentication
    let authToken = authenticateUser(session, user);
    if (!authToken) return;
    
    sleep(1);
    
    // Dashboard access
    group('Dashboard Access', function () {
      let startTime = new Date().getTime();
      let response = http.get(`${BASE_URL}/dashboard`, {
        headers: {
          ...session.headers,
          'Authorization': `Bearer ${authToken}`,
        },
      });
      let endTime = new Date().getTime();
      
      pageLoadTime.add(endTime - startTime);
      
      check(response, {
        'dashboard status is 200': (r) => r.status === 200,
        'dashboard loads metrics': (r) => r.body.includes('analytics') || r.body.includes('metrics'),
      });
      
      errorRate.add(response.status >= 400);
    });
    
    sleep(3);
    
    // Analytics viewing
    group('Analytics Access', function () {
      let response = http.get(`${API_BASE_URL}/analytics`, {
        headers: {
          ...session.headers,
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      check(response, {
        'analytics status is 200': (r) => r.status === 200,
        'analytics contains data': (r) => {
          try {
            let data = JSON.parse(r.body);
            return data && typeof data === 'object';
          } catch (e) {
            return false;
          }
        },
      });
      
      errorRate.add(response.status >= 400);
    });
    
    sleep(2);
    
    // Content generation
    generateContent(session, authToken);
    
    sleep(1);
    
    // Campaign management
    group('Campaign Management', function () {
      let response = http.get(`${API_BASE_URL}/campaigns`, {
        headers: {
          ...session.headers,
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      check(response, {
        'campaigns status is 200': (r) => r.status === 200,
      });
      
      errorRate.add(response.status >= 400);
    });
  });
}

// Business owner journey - focuses on ROI and business metrics
function businessOwnerJourney(session, user) {
  group('Business Owner Journey', function () {
    // Quick auth and dashboard
    let authToken = authenticateUser(session, user);
    if (!authToken) return;
    
    sleep(1);
    
    // Business metrics focus
    group('Business Metrics', function () {
      let response = http.get(`${API_BASE_URL}/metrics/business`, {
        headers: {
          ...session.headers,
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      check(response, {
        'business metrics status is 200': (r) => r.status === 200,
      });
      
      errorRate.add(response.status >= 400);
    });
    
    sleep(2);
    
    // Customer insights
    group('Customer Insights', function () {
      let response = http.get(`${API_BASE_URL}/customers/insights`, {
        headers: {
          ...session.headers,
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      check(response, {
        'customer insights status is 200': (r) => r.status === 200,
      });
      
      errorRate.add(response.status >= 400);
    });
    
    sleep(1);
    
    // Quick content generation
    generateContent(session, authToken);
  });
}

// Content creator journey - heavy on content generation
function contentCreatorJourney(session, user) {
  group('Content Creator Journey', function () {
    let authToken = authenticateUser(session, user);
    if (!authToken) return;
    
    sleep(1);
    
    // Multiple content generation requests
    for (let i = 0; i < 3; i++) {
      generateContent(session, authToken);
      sleep(1);
    }
    
    // Content library access
    group('Content Library', function () {
      let response = http.get(`${API_BASE_URL}/content/library`, {
        headers: {
          ...session.headers,
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      check(response, {
        'content library status is 200': (r) => r.status === 200,
      });
      
      errorRate.add(response.status >= 400);
    });
    
    sleep(2);
    
    // Template access
    group('Templates Access', function () {
      let response = http.get(`${API_BASE_URL}/templates`, {
        headers: {
          ...session.headers,
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      check(response, {
        'templates status is 200': (r) => r.status === 200,
      });
      
      errorRate.add(response.status >= 400);
    });
  });
}

// Casual user journey - basic exploration
function casualUserJourney(session, user) {
  group('Casual User Journey', function () {
    // Landing page
    let response = http.get(BASE_URL, session);
    
    check(response, {
      'landing page status is 200': (r) => r.status === 200,
    });
    
    errorRate.add(response.status >= 400);
    
    sleep(3);
    
    // Maybe authenticate
    if (Math.random() < 0.7) {
      let authToken = authenticateUser(session, user);
      if (authToken) {
        sleep(2);
        generateContent(session, authToken);
      }
    }
  });
}

// Authentication helper
function authenticateUser(session, user) {
  let authToken = null;
  
  group('Authentication', function () {
    let startTime = new Date().getTime();
    
    let loginData = {
      email: user.email,
      password: user.password,
    };
    
    let response = http.post(`${API_BASE_URL}/auth/login`, JSON.stringify(loginData), session);
    
    let endTime = new Date().getTime();
    authenticationTime.add(endTime - startTime);
    
    let isSuccess = check(response, {
      'login status is 200': (r) => r.status === 200,
      'login returns token': (r) => {
        try {
          let data = JSON.parse(r.body);
          return data && data.token;
        } catch (e) {
          return false;
        }
      },
    });
    
    if (isSuccess) {
      try {
        let data = JSON.parse(response.body);
        authToken = data.token;
      } catch (e) {
        console.log('Failed to parse login response');
      }
    } else {
      failedLogins.add(1);
    }
    
    errorRate.add(response.status >= 400);
  });
  
  return authToken;
}

// Content generation helper
function generateContent(session, authToken) {
  group('Content Generation', function () {
    let startTime = new Date().getTime();
    
    let contentRequest = {
      prompt: randomPrompt(),
      platform: ['facebook', 'instagram', 'twitter', 'linkedin'][Math.floor(Math.random() * 4)],
      tone: ['professional', 'casual', 'friendly', 'enthusiastic'][Math.floor(Math.random() * 4)],
      length: ['short', 'medium', 'long'][Math.floor(Math.random() * 3)],
    };
    
    let response = http.post(
      `${API_BASE_URL}/content/generate`,
      JSON.stringify(contentRequest),
      {
        headers: {
          ...session.headers,
          'Authorization': `Bearer ${authToken}`,
        },
        timeout: '30s', // AI generation can take time
      }
    );
    
    let endTime = new Date().getTime();
    contentGenerationTime.add(endTime - startTime);
    
    let isSuccess = check(response, {
      'content generation status is 200': (r) => r.status === 200,
      'content generation returns content': (r) => {
        try {
          let data = JSON.parse(r.body);
          return data && data.content && data.content.length > 0;
        } catch (e) {
          return false;
        }
      },
    });
    
    if (isSuccess && Math.random() < 0.3) {
      successfulConversions.add(1);
    }
    
    errorRate.add(response.status >= 400);
  });
}

// Generate detailed HTML report
export function handleSummary(data) {
  return {
    'load-test-results.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

// Setup and teardown
export function setup() {
  console.log('🚀 Starting Orbit MKT Load Test');
  console.log(`Target URL: ${BASE_URL}`);
  console.log(`Test Users: ${testUsers.length}`);
  console.log(`Content Prompts: ${contentPrompts.length}`);
  
  // Health check before starting
  let healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    throw new Error(`Health check failed: ${healthCheck.status}`);
  }
  
  return { timestamp: new Date().toISOString() };
}

export function teardown(data) {
  console.log(`🏁 Load test completed at: ${new Date().toISOString()}`);
  console.log(`Test started at: ${data.timestamp}`);
}