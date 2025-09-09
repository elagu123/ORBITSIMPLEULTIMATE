# 🔌 API Documentation

## 📋 Overview

The Orbit Marketing Platform provides RESTful APIs for integrating with external systems and building custom applications. All APIs require authentication and follow standard HTTP conventions.

## 🔐 Authentication

### **API Key Authentication**
```bash
# Include in headers
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### **JWT Token Authentication (Recommended)**
```bash
# Login to get token
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Use token in subsequent requests
Authorization: Bearer JWT_TOKEN
```

### **Getting API Keys**
1. Go to **Settings** → **API Keys**
2. Click **Generate New Key**
3. Copy and store securely
4. Set appropriate permissions

---

## 📊 Base URL & Versioning

```
Base URL: https://api.orbit-marketing.com/v1
Development: http://localhost:3001/api/v1
```

**API Version**: v1 (current)
**Rate Limits**: 100 requests/minute per API key

---

## 🔗 Core Endpoints

### **Authentication**

#### **Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token",
      "expiresIn": 3600
    }
  }
}
```

#### **Refresh Token**
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}
```

#### **Logout**
```http
POST /api/auth/logout
Authorization: Bearer JWT_TOKEN
```

---

### **Customers**

#### **List Customers**
```http
GET /api/customers
Authorization: Bearer JWT_TOKEN
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 100)
- `search` (optional): Search by name or email
- `tags` (optional): Filter by tags (comma-separated)
- `status` (optional): active, inactive, at-risk

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "cust_123",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "company": "Example Corp",
        "tags": ["vip", "loyal"],
        "status": "active",
        "engagementScore": 8.5,
        "lifetimeValue": 2500.00,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-03-01T14:20:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### **Create Customer**
```http
POST /api/customers
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1987654321",
  "company": "Smith Industries",
  "tags": ["new", "prospect"],
  "notes": "Interested in premium features"
}
```

#### **Get Customer**
```http
GET /api/customers/{customer_id}
Authorization: Bearer JWT_TOKEN
```

#### **Update Customer**
```http
PUT /api/customers/{customer_id}
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith-Johnson",
  "tags": ["vip", "loyal"],
  "notes": "Updated contact information"
}
```

#### **Delete Customer**
```http
DELETE /api/customers/{customer_id}
Authorization: Bearer JWT_TOKEN
```

---

### **Content**

#### **List Content**
```http
GET /api/content
Authorization: Bearer JWT_TOKEN
```

**Query Parameters:**
- `type` (optional): social, email, blog, ad
- `status` (optional): draft, scheduled, published
- `platform` (optional): facebook, instagram, twitter, linkedin

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "content_123",
        "title": "Spring Sale Announcement",
        "type": "social",
        "platform": "facebook",
        "status": "published",
        "content": {
          "text": "🌸 Spring Sale is here! Save 30% on all products...",
          "image": "https://cdn.orbit.com/images/spring-sale.jpg"
        },
        "scheduledAt": "2024-03-15T09:00:00Z",
        "publishedAt": "2024-03-15T09:00:00Z",
        "performance": {
          "views": 5420,
          "likes": 234,
          "shares": 45,
          "clicks": 87
        }
      }
    ]
  }
}
```

#### **Create Content**
```http
POST /api/content
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "title": "New Product Launch",
  "type": "social",
  "platform": "instagram",
  "content": {
    "text": "Introducing our latest innovation! 🚀",
    "image": "https://example.com/product-image.jpg"
  },
  "scheduledAt": "2024-03-20T14:00:00Z",
  "tags": ["product-launch", "innovation"]
}
```

#### **Schedule Content**
```http
POST /api/content/{content_id}/schedule
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "scheduledAt": "2024-03-20T14:00:00Z",
  "platform": "instagram"
}
```

#### **Get Content Performance**
```http
GET /api/content/{content_id}/analytics
Authorization: Bearer JWT_TOKEN
```

---

### **AI Services**

#### **Generate Content**
```http
POST /api/ai/generate-content
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "type": "social",
  "platform": "facebook",
  "prompt": "Create a promotional post for our new eco-friendly water bottles",
  "context": {
    "businessName": "EcoBottle Co",
    "industry": "sustainability",
    "tone": "friendly",
    "targetAudience": "environmentally conscious consumers"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": {
      "text": "🌍 Introducing EcoBottle's newest addition to sustainable living! Our new eco-friendly water bottles are made from 100% recycled materials and designed to keep your drinks perfectly chilled while protecting our planet. Join the green revolution - one sip at a time! 💚 #EcoFriendly #Sustainability #EcoBottle",
      "hashtags": ["#EcoFriendly", "#Sustainability", "#EcoBottle", "#GreenLiving"],
      "suggestions": [
        "Add a product image for better engagement",
        "Consider posting at 2 PM for optimal reach",
        "Include a call-to-action link to your product page"
      ]
    },
    "analysis": {
      "sentiment": "positive",
      "readabilityScore": 8.2,
      "engagementPrediction": 7.5
    }
  }
}
```

#### **Get AI Insights**
```http
POST /api/ai/insights
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "type": "customer_analysis",
  "customerIds": ["cust_123", "cust_456"],
  "period": "30_days"
}
```

#### **Optimize Content**
```http
POST /api/ai/optimize-content
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "contentId": "content_123",
  "optimization": "engagement",
  "platform": "facebook"
}
```

---

### **Analytics**

#### **Get Dashboard Metrics**
```http
GET /api/analytics/dashboard
Authorization: Bearer JWT_TOKEN
```

**Query Parameters:**
- `period` (optional): 7d, 30d, 90d, 1y (default: 30d)

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalCustomers": 1250,
      "customerGrowth": 8.5,
      "totalContent": 89,
      "contentPerformance": 7.2,
      "totalRevenue": 45000.00,
      "revenueGrowth": 12.3,
      "engagementRate": 4.8
    },
    "period": "30d",
    "lastUpdated": "2024-03-15T12:00:00Z"
  }
}
```

#### **Get Content Analytics**
```http
GET /api/analytics/content
Authorization: Bearer JWT_TOKEN
```

**Query Parameters:**
- `period`: 7d, 30d, 90d (default: 30d)
- `platform`: facebook, instagram, twitter, linkedin
- `type`: social, email, blog, ad

#### **Get Customer Analytics**
```http
GET /api/analytics/customers
Authorization: Bearer JWT_TOKEN
```

---

### **Campaigns**

#### **List Campaigns**
```http
GET /api/campaigns
Authorization: Bearer JWT_TOKEN
```

#### **Create Campaign**
```http
POST /api/campaigns
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "name": "Spring Sale 2024",
  "type": "promotional",
  "startDate": "2024-03-15T00:00:00Z",
  "endDate": "2024-03-31T23:59:59Z",
  "budget": 5000.00,
  "targetAudience": {
    "tags": ["loyal", "engaged"],
    "demographics": {
      "age": "25-45",
      "location": "US"
    }
  },
  "content": ["content_123", "content_124"],
  "channels": ["facebook", "instagram", "email"]
}
```

#### **Get Campaign Performance**
```http
GET /api/campaigns/{campaign_id}/performance
Authorization: Bearer JWT_TOKEN
```

---

## 📝 Webhooks

Subscribe to real-time events from the Orbit platform.

### **Setting Up Webhooks**
```http
POST /api/webhooks
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "url": "https://your-site.com/webhooks/orbit",
  "events": ["customer.created", "content.published", "campaign.completed"],
  "secret": "your_webhook_secret"
}
```

### **Webhook Events**

#### **Customer Events**
- `customer.created`
- `customer.updated` 
- `customer.deleted`
- `customer.engagement_changed`

#### **Content Events**
- `content.created`
- `content.scheduled`
- `content.published`
- `content.performance_updated`

#### **Campaign Events**
- `campaign.started`
- `campaign.completed`
- `campaign.paused`

### **Webhook Payload Example**
```json
{
  "event": "content.published",
  "timestamp": "2024-03-15T09:00:00Z",
  "data": {
    "contentId": "content_123",
    "title": "Spring Sale Announcement",
    "platform": "facebook",
    "publishedAt": "2024-03-15T09:00:00Z",
    "url": "https://facebook.com/post/123"
  }
}
```

---

## 🔄 Error Handling

### **Error Response Format**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The email field is required",
    "details": {
      "field": "email",
      "rejectedValue": "",
      "constraint": "required"
    }
  }
}
```

### **Common Error Codes**
- `UNAUTHORIZED`: Invalid or missing authentication
- `FORBIDDEN`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

### **HTTP Status Codes**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Rate Limited
- `500`: Internal Server Error

---

## 💡 Best Practices

### **Authentication**
- Store API keys securely, never in client-side code
- Rotate API keys regularly
- Use JWT tokens for web applications
- Implement proper token refresh logic

### **Rate Limiting**
- Implement exponential backoff for retries
- Monitor your usage to avoid hitting limits
- Cache responses when possible
- Use bulk operations for multiple items

### **Error Handling**
- Always check the `success` field in responses
- Implement proper error handling for all scenarios
- Log errors for debugging but don't expose details to users
- Provide meaningful error messages to end users

### **Data Management**
- Use pagination for large datasets
- Implement proper validation on your side
- Handle optional fields appropriately
- Keep data synchronized between systems

---

## 🛠️ SDK Libraries

### **JavaScript/TypeScript**
```bash
npm install @orbit-marketing/js-sdk
```

```javascript
import { OrbitClient } from '@orbit-marketing/js-sdk';

const orbit = new OrbitClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.orbit-marketing.com/v1'
});

// List customers
const customers = await orbit.customers.list();

// Create content
const content = await orbit.content.create({
  title: 'New Post',
  type: 'social',
  platform: 'facebook'
});
```

### **Python**
```bash
pip install orbit-marketing-sdk
```

```python
from orbit_marketing import OrbitClient

client = OrbitClient(api_key='your_api_key')

# List customers
customers = client.customers.list()

# Generate AI content
content = client.ai.generate_content({
    'type': 'social',
    'platform': 'facebook',
    'prompt': 'Create a post about our new product'
})
```

---

## 📞 API Support

### **Documentation Issues**
- 📧 Email: api-docs@orbit-marketing.com
- 💬 Developer Slack: [Join here](https://orbit-dev-slack.com)

### **Technical Support**
- 🎫 Support Portal: https://support.orbit-marketing.com
- 📱 Developer Hotline: +1-555-ORBIT-DEV
- 📚 Developer Forum: https://developers.orbit-marketing.com

### **Feature Requests**
- Submit via [GitHub Issues](https://github.com/orbit-marketing/api-requests)
- Vote on existing requests
- Join monthly developer calls

---

**Happy Coding! 🚀**