# GAP Service Request Management API

A RESTful API built with NestJS for managing service requests between clients and service providers in building facilities.

## Features

- User management (clients and service providers)
- Service request creation and assignment
- Status workflow management (open → in_progress → done)
- Role-based access control
- Request filtering and listing

## Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: MongoDB with Mongoose
- **Validation**: class-validator & class-transformer
- **Testing**: Jest

## Prerequisites

- Node.js (v16 or higher)
- Docker (for MongoDB)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/siddhantagwl/gap-api.git
cd gap-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start MongoDB with Docker

```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

### 4. Run the application

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Users

#### Create a User

**Request:**
```http
POST /users
Content-Type: application/json

{
  "name": "test user 1",
  "email": "test_user@gap.com",
  "role": "client"
}
```

**Response:**
```json
{
  "_id": "671e8f2a3c9d4b001f8e4c21",
  "name": "test user 1",
  "email": "test_user@gap.com",
  "role": "client",
  "__v": 0
}
```

#### Get User by ID

**Request:**
```http
GET /users/:id
```

**Response:**
```json
{
  "_id": "671e8f2a3c9d4b001f8e4c21",
  "name": "test user 1",
  "email": "test_user@gap.com",
  "role": "client",
  "__v": 0
}
```

### Service Requests

#### Create a Service Request

**Request:**
```http
POST /service-requests
Content-Type: application/json

{
  "title": "Fix elevator",
  "description": "Elevator stuck on 5th floor",
  "createdBy": "671e8f2a3c9d4b001f8e4c21"
}
```

**Response:**
```json
{
  "_id": "671e9a5b4d8e3f001c2a1b3c",
  "title": "Fix elevator",
  "description": "Elevator stuck on 5th floor",
  "status": "open",
  "createdBy": "671e8f2a3c9d4b001f8e4c21",
  "__v": 0
}
```

> **Note:** Only users with role `client` can create requests

#### Assign Request to Service Provider

**Request:**
```http
PATCH /service-requests/:id/assign/:userId
```

**Example:**
```http
PATCH /service-requests/671e9a5b4d8e3f001c2a1b3c/assign/671e8f5c3c9d4b001f8e4c22
```

**Response:**
```json
{
  "_id": "671e9a5b4d8e3f001c2a1b3c",
  "title": "Fix elevator",
  "description": "Elevator stuck on 5th floor",
  "status": "open",
  "createdBy": "671e8f2a3c9d4b001f8e4c21",
  "assignedTo": "671e8f5c3c9d4b001f8e4c22",
  "__v": 0
}
```

> Only users with role `service_provider` can be assigned

#### Update Request Status

**Request:**
```http
PATCH /service-requests/:id/status
Content-Type: application/json

{
  "status": "in_progress"
}
```

**Response:**
```json
{
  "_id": "671e9a5b4d8e3f001c2a1b3c",
  "title": "Fix elevator",
  "description": "Elevator stuck on 5th floor",
  "status": "in_progress",
  "createdBy": "671e8f2a3c9d4b001f8e4c21",
  "assignedTo": "671e8f5c3c9d4b001f8e4c22",
  "__v": 0
}
```

> **Note:** Status can only move forward: `open` → `in_progress` → `done`

#### List Service Requests

**Request:**
```http
GET /service-requests
```

**Response:**
```json
[
  {
    "_id": "671e9a5b4d8e3f001c2a1b3c",
    "title": "Fix elevator",
    "description": "Elevator stuck on 5th floor",
    "status": "open",
    "createdBy": {
      "_id": "671e8f2a3c9d4b001f8e4c21",
      "name": "test user 1",
      "email": "test_user@gap.com",
      "role": "client"
    },
    "assignedTo": null,
    "__v": 0
  }
]
```

**we. can filter by status:**
```http
GET /service-requests?status=open
GET /service-requests?status=in_progress
GET /service-requests?status=done
```

## Business Rules as stated:

1. **Only clients can create service requests**
   - Service providers cannot create requests
   - Attempting to create a request with a service provider will return `403 Forbidden`

2. **Only service providers can be assigned**
   - Clients cannot be assigned to requests
   - Attempting to assign a client will return `403 Forbidden`

3. **Status progression is one-way**
   - Requests can only move forward: `open` → `in_progress` → `done`
   - Cannot skip statuses (e.g., `open` → `done`)
   - Cannot move backwards (e.g., `done` → `open`)
   - Attempting invalid transitions will return `403 Forbidden`


## Running Tests

```bash
# Run all tests
npm test
```

**Test Results:**
```
Test Suites: 5 passed, 5 total
Tests:       11 passed, 11 total
```

## Testing with Postman as i did on my mac

### Step 1: Create a Client User

```http
POST http://localhost:3000/users
Content-Type: application/json

{
  "name": "test user 1",
  "email": "john@test.com",
  "role": "client"
}
```

Copy the `_id` from the response.

### Step 2: Create a Service Provider

```http
POST http://localhost:3000/users
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@test.com",
  "role": "service_provider"
}
```

Copy the `_id` from the response.

### Step 3: Create a Service Request

```http
POST http://localhost:3000/service-requests
Content-Type: application/json

{
  "title": "Fix AC",
  "description": "Air conditioning not cooling",
  "createdBy": "CLIENT_ID_HERE"
}
```

Replace `CLIENT_ID_HERE` with the client's ID from Step 1.

### Step 4: Assign to Service Provider

```http
PATCH http://localhost:3000/service-requests/REQUEST_ID/assign/PROVIDER_ID
```

Replace:
- `REQUEST_ID` with the service request ID from Step 3
- `PROVIDER_ID` with the service provider ID from Step 2

### Step 5: Update Status

```http
PATCH http://localhost:3000/service-requests/REQUEST_ID/status
Content-Type: application/json

{
  "status": "in_progress"
}
```

### Step 6: Update Status Again

```http
PATCH http://localhost:3000/service-requests/REQUEST_ID/status
Content-Type: application/json

{
  "status": "done"
}
```

### Step 7: List All Requests

```http
GET http://localhost:3000/service-requests
```

### Step 8: Filter by Status

```http
GET http://localhost:3000/service-requests?status=open
```

## Error Handling

The API returns appropriate HTTP status codes:

| Status Code | Description |
|------------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation errors) |
| `403` | Forbidden (business rule violations) |
| `404` | Not Found |
| `500` | Internal Server Error |

## Validation Examples

### Invalid Role

**Request:**
```json
{
  "name": "Test User",
  "email": "test@test.com",
  "role": "admin"
}
```

**Response:**
```json
{
  "statusCode": 400,
  "message": [
    "role must be one of the following values: client, service_provider"
  ],
  "error": "Bad Request"
}
```

### Invalid Email

**Request:**
```json
{
  "name": "Test User",
  "email": "not-an-email",
  "role": "client"
}
```

**Response:**
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email"
  ],
  "error": "Bad Request"
}
```

### Service Provider Creating Request

**Request:**
```json
{
  "title": "Fix elevator",
  "description": "Test",
  "createdBy": "SERVICE_PROVIDER_ID"
}
```

**Response:**
```json
{
  "statusCode": 403,
  "message": "Only clients can create service requests",
  "error": "Forbidden"
}
```

### Client Being Assigned to Request

**Request:**
```http
PATCH /service-requests/req_id/assign/c_id
```

**Response:**
```json
{
  "statusCode": 403,
  "message": "Only service providers can be assigned to requests",
  "error": "Forbidden"
}
```

### Invalid Status Transition

**Request:**
```json
{
  "status": "done"
}
```

When current status is `open`:

**Response:**
```json
{
  "statusCode": 403,
  "message": "Cannot transition from open to done. Valid next status: in_progress",
  "error": "Forbidden"
}
```

