# 🐝 Kingdom of Bees - API Documentation

## Base URL
```
Development: http://localhost:4000/api
Production: https://api.kingdom-of-bees.com/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password@123",
  "fullName": "John Doe",
  "userType": "OWNER" // Optional: OWNER, WORKER, EXPLORER
}

Response 201:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "userType": "OWNER"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password@123"
}

Response 200:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "userType": "OWNER"
  }
}
```

---

## 🏠 Apiary Endpoints

### List Apiaries
```http
GET /apiaries
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "منحل الرياض",
      "type": "STATIONARY",
      "locationLat": 24.7136,
      "locationLng": 46.6753,
      "_count": {
        "hives": 10
      }
    }
  ]
}
```

### Create Apiary
```http
POST /apiaries
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "منحل الرياض",
  "type": "STATIONARY",
  "locationLat": 24.7136,
  "locationLng": 46.6753,
  "address": "الرياض، السعودية",
  "description": "منحل ثابت"
}

Response 201:
{
  "success": true,
  "message": "Apiary created successfully",
  "data": { ... }
}
```

### Get Apiary
```http
GET /apiaries/:id
Authorization: Bearer <token>
```

### Update Apiary
```http
PUT /apiaries/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "منحل الرياض المحدث"
}
```

### Delete Apiary
```http
DELETE /apiaries/:id
Authorization: Bearer <token>

Response 204: No Content
```

---

## 🐝 Hive Endpoints

### List Hives
```http
GET /hives
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "hiveNumber": "H-001",
      "hiveType": "LANGSTROTH",
      "status": "ACTIVE",
      "apiary": { ... },
      "_count": {
        "inspections": 5,
        "honeyHarvests": 2
      }
    }
  ]
}
```

### Create Hive
```http
POST /hives
Authorization: Bearer <token>
Content-Type: application/json

{
  "apiaryId": "uuid",
  "hiveNumber": "H-001",
  "hiveType": "LANGSTROTH",
  "status": "ACTIVE",
  "notes": "خلية جديدة"
}
```

---

## 🚨 Alert Endpoints

### List Alerts
```http
GET /alerts?lat=24.7136&lng=46.6753&radius=50
Authorization: Bearer <token>

Query Parameters:
- lat: Latitude (optional)
- lng: Longitude (optional)
- radius: Radius in km (optional)

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "تنبيه مرض",
      "message": "تم رصد مرض في المنطقة",
      "priority": "URGENT",
      "status": "ACTIVE",
      "apiary": { ... }
    }
  ]
}
```

### Create Alert
```http
POST /alerts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "تنبيه مرض",
  "message": "تم رصد مرض",
  "alertType": "DISEASE",
  "priority": "HIGH",
  "apiaryId": "uuid"
}
```

### Update Alert Status
```http
PUT /alerts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "RESOLVED"
}
```

---

## 📋 Inspection Endpoints

### List Inspections
```http
GET /inspections
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "inspectionDate": "2026-01-01T00:00:00Z",
      "inspectionType": "ROUTINE",
      "overallHealth": "EXCELLENT",
      "hive": { ... }
    }
  ]
}
```

### Create Inspection
```http
POST /inspections
Authorization: Bearer <token>
Content-Type: application/json

{
  "hiveId": "uuid",
  "inspectionType": "ROUTINE",
  "weather": "مشمس",
  "temperature": 28,
  "notes": "الخلية في حالة جيدة"
}
```

---

## 👨‍💼 Admin Endpoints

### Get Dashboard Stats
```http
GET /admin/stats
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "totalApiaries": 50,
    "activeAlerts": 5,
    "todayOperations": 20
  }
}
```

### Get Recent Activities
```http
GET /admin/activities?limit=10
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "inspection",
      "description": "تم فحص خلية H-001",
      "timestamp": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

## 🔒 Authorization

### User Types & Permissions

| Endpoint | ADMIN | OWNER | WORKER | EXPLORER |
|----------|-------|-------|--------|----------|
| Auth | ✅ | ✅ | ✅ | ✅ |
| Apiaries | ✅ | ✅ (own) | ✅ (assigned) | ❌ |
| Hives | ✅ | ✅ (own) | ✅ (assigned) | ❌ |
| Inspections | ✅ | ✅ (own) | ✅ (assigned) | ❌ |
| Alerts | ✅ | ✅ | ✅ | ✅ (read) |
| Admin | ✅ | ✅ (limited) | ❌ | ❌ |

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": { ... }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🚀 Rate Limiting

- **Development:** No limits
- **Production:** 100 requests per 15 minutes per IP

---

**Last Updated:** 2026-01-01  
**Version:** 1.0.0
