# BioVault API Documentation

Complete API reference for BioVault backend integration.

## Base URL

```
https://api.biovault.dev/v1
```

## Authentication

All requests (except `/auth/register`) require a Bearer token:

```http
Authorization: Bearer <token>
```

Tokens are obtained after successful authentication via `/auth/unlock`.

## Rate Limiting

- **Registration**: 5 requests per hour per IP
- **Biometric Enrollment**: 10 requests per hour per user
- **Authentication**: 20 requests per hour per user
- **General**: 100 requests per hour per user

## Endpoints

### 1. User Registration

Register a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "passwordHash": "optional-base64-encoded-hash"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "userId": "user_abc123xyz",
  "message": "User registered successfully",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Errors:**
- `400 Bad Request` - Invalid input data
- `409 Conflict` - Username or email already exists
- `429 Too Many Requests` - Rate limit exceeded

---

### 2. Face Biometric Enrollment

Enroll face biometric data for a user.

**Endpoint:** `POST /api/biometrics/face/enroll`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user_abc123xyz",
  "faceEmbedding": "base64-encoded-face-embedding",
  "metadata": {
    "device": "Chrome 120 on MacOS",
    "timestamp": "2025-01-15T10:35:00Z",
    "captureMethod": "webcam",
    "imageQuality": 0.95
  }
}
```

**Face Embedding Format:**
- Base64-encoded 128-dimensional float array
- Generated from face detection and feature extraction
- Recommended libraries: face-api.js, MediaPipe Face Mesh

**Response (201 Created):**
```json
{
  "success": true,
  "enrollmentId": "enroll_face_xyz789",
  "confidence": 0.98,
  "message": "Face biometric enrolled successfully",
  "enrollmentDate": "2025-01-15T10:35:00Z"
}
```

**Errors:**
- `400 Bad Request` - Invalid embedding format
- `401 Unauthorized` - Missing or invalid token
- `409 Conflict` - Face already enrolled for this user
- `422 Unprocessable Entity` - Low quality embedding

---

### 3. Voice Biometric Enrollment

Enroll voice biometric data for a user.

**Endpoint:** `POST /api/biometrics/audio/enroll`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user_abc123xyz",
  "audioEmbedding": "base64-encoded-voice-embedding",
  "metadata": {
    "duration": 3.5,
    "transcript": "BioVault secures my passwords",
    "timestamp": "2025-01-15T10:40:00Z",
    "device": "Chrome 120 on MacOS",
    "sampleRate": 44100,
    "audioQuality": 0.92
  }
}
```

**Voice Embedding Format:**
- Base64-encoded voice feature vector
- Extracted from 2-5 seconds of clear speech
- Recommended libraries: Web Audio API + speaker recognition SDK

**Response (201 Created):**
```json
{
  "success": true,
  "enrollmentId": "enroll_voice_abc456",
  "confidence": 0.95,
  "transcript": "BioVault secures my passwords",
  "message": "Voice biometric enrolled successfully",
  "enrollmentDate": "2025-01-15T10:40:00Z"
}
```

**Errors:**
- `400 Bad Request` - Invalid embedding or audio format
- `401 Unauthorized` - Missing or invalid token
- `409 Conflict` - Voice already enrolled for this user
- `422 Unprocessable Entity` - Audio quality too low or too short

---

### 4. Unlock Vault (Authentication)

Authenticate and unlock vault using biometric or password.

**Endpoint:** `POST /api/auth/unlock`

**Request Body:**
```json
{
  "userId": "user_abc123xyz",
  "method": "face",
  "proof": "base64-encoded-biometric-proof",
  "otp": "123456"
}
```

**Methods:**
- `face` - Face recognition
- `voice` - Voice recognition
- `both` - Both face and voice required
- `password` - Password + optional OTP

**Response (200 OK - Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_xyz",
  "confidence": 0.96,
  "message": "Vault unlocked successfully",
  "sessionId": "session_def789ghi",
  "expiresIn": 3600
}
```

**Response (401 Unauthorized - Failure):**
```json
{
  "success": false,
  "confidence": 0.45,
  "message": "Biometric verification failed",
  "threshold": 0.80,
  "attemptsRemaining": 2
}
```

**Errors:**
- `400 Bad Request` - Invalid method or missing proof
- `401 Unauthorized` - Authentication failed
- `403 Forbidden` - Account locked after too many failed attempts
- `429 Too Many Requests` - Rate limit exceeded

---

### 5. Get User Sessions

Retrieve recent login/logout sessions for the authenticated user.

**Endpoint:** `GET /api/user/sessions`

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional) - Number of sessions to return (default: 10, max: 50)
- `offset` (optional) - Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "sessions": [
    {
      "sessionId": "session_001",
      "loginTime": "2025-01-15T09:00:00Z",
      "logoutTime": "2025-01-15T10:30:00Z",
      "method": "face",
      "device": "Chrome 120 on MacOS",
      "ipAddress": "192.168.1.100",
      "location": "San Francisco, CA"
    },
    {
      "sessionId": "session_002",
      "loginTime": "2025-01-14T14:20:00Z",
      "logoutTime": "2025-01-14T16:45:00Z",
      "method": "voice",
      "device": "Safari 17 on iOS",
      "ipAddress": "192.168.1.101",
      "location": "San Francisco, CA"
    }
  ],
  "total": 25,
  "limit": 10,
  "offset": 0
}
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - User not found

---

### 6. Generate Password

Generate a cryptographically secure password.

**Endpoint:** `POST /api/tools/generate-password`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "length": 16,
  "includeNumbers": true,
  "includeSymbols": true,
  "includeUppercase": true,
  "includeLowercase": true,
  "excludeSimilar": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "password": "Kx9!mP2@vL7#zQ4$",
  "strength": "Strong",
  "entropy": 95.6,
  "estimatedCrackTime": "centuries"
}
```

---

### 7. Export Vault Data

Export encrypted vault data for backup.

**Endpoint:** `POST /api/data/export`

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": "base64-encoded-encrypted-vault-data",
  "filename": "biovault_export_20250115_103000.json",
  "exportDate": "2025-01-15T10:30:00Z",
  "entryCount": 42
}
```

---

### 8. Import Vault Data

Import encrypted vault data from backup.

**Endpoint:** `POST /api/data/import`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "data": "base64-encoded-encrypted-vault-data"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "importedCount": 42,
  "skippedCount": 0,
  "duplicateCount": 0,
  "message": "Data imported successfully",
  "importDate": "2025-01-15T10:35:00Z"
}
```

---

### 9. Delete Biometric Data

Permanently delete user's biometric data.

**Endpoint:** `DELETE /api/biometrics/delete`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user_abc123xyz",
  "method": "all",
  "confirmationCode": "DELETE-ALL-BIOMETRICS"
}
```

**Methods:**
- `face` - Delete face biometrics only
- `voice` - Delete voice biometrics only
- `all` - Delete all biometric data

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Biometric data deleted successfully",
  "deletedTypes": ["face", "voice"],
  "deletionDate": "2025-01-15T10:40:00Z"
}
```

**Errors:**
- `400 Bad Request` - Invalid method or missing confirmation
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Incorrect confirmation code

---

### 10. Update Settings

Update user security settings.

**Endpoint:** `PUT /api/settings/update`

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "vpnOnly": true,
  "saveRawData": false,
  "twoFactorEnabled": true,
  "sessionTimeout": 3600
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "settings": {
    "vpnOnly": true,
    "saveRawData": false,
    "twoFactorEnabled": true,
    "sessionTimeout": 3600
  },
  "message": "Settings updated successfully",
  "updatedAt": "2025-01-15T10:45:00Z"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional context (optional)"
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Common Error Codes

- `INVALID_INPUT` - Request validation failed
- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

---

## Webhooks

BioVault can send webhooks for important events:

### Event Types

- `user.registered` - New user registration
- `biometric.enrolled` - Biometric enrollment success
- `auth.failed` - Failed authentication attempt
- `auth.success` - Successful authentication
- `data.exported` - Vault data exported
- `settings.updated` - Settings changed

### Webhook Payload

```json
{
  "event": "auth.failed",
  "timestamp": "2025-01-15T10:30:00Z",
  "userId": "user_abc123xyz",
  "data": {
    "method": "face",
    "confidence": 0.45,
    "ipAddress": "192.168.1.100"
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import BioVaultSDK from '@biovault/sdk';

const client = new BioVaultSDK({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.biovault.dev/v1'
});

// Register user
const user = await client.auth.register({
  name: 'John Doe',
  email: 'john@example.com',
  username: 'johndoe'
});

// Enroll face
const enrollment = await client.biometrics.enrollFace({
  userId: user.userId,
  faceEmbedding: faceEmbeddingData
});

// Unlock vault
const session = await client.auth.unlock({
  userId: user.userId,
  method: 'face',
  proof: biometricProof
});
```

---

## Best Practices

1. **Always use HTTPS** - Never send biometric data over unencrypted connections
2. **Store tokens securely** - Use secure storage (e.g., httpOnly cookies, secure localStorage)
3. **Handle errors gracefully** - Provide clear feedback to users
4. **Rate limit protection** - Implement client-side rate limiting
5. **Biometric quality checks** - Validate quality before sending to server
6. **Consent management** - Always get explicit user consent for biometric processing

---

For more information, visit [https://docs.biovault.dev](https://docs.biovault.dev)
