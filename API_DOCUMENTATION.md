# API Documentation

Complete reference guide for EimemesChat AI API endpoints and serverless functions.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Chat Endpoint](#chat-endpoint)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

---

## Overview

EimemesChat AI uses Vercel serverless functions to handle backend operations. All API requests must include proper Firebase authentication tokens.

### Base URL
```
https://eimemes-chat-ai.vercel.app
```

### API Endpoints
- `POST /api/chat` — Stream AI responses using Server-Sent Events (SSE)

---

## Authentication

### Firebase Authentication

All API requests require a valid Firebase authentication token in the `Authorization` header.

**Header Format:**
```
Authorization: Bearer <firebase_id_token>
```

**How to get a token:**
1. User authenticates via Firebase Auth (Google Sign-In)
2. Firebase SDK automatically manages tokens
3. Token is automatically sent by the client for each request

**Token Validation:**
- Server-side verification using Firebase Admin SDK
- Tokens include user UID and claims
- Expired tokens are rejected with `401 Unauthorized`

---

## Chat Endpoint

### `POST /api/chat`

Stream AI responses in real-time using Server-Sent Events (SSE).

#### Request

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer <firebase_id_token>
```

**Body:**
```json
{
  "message": "What is the capital of France?",
  "conversationId": "conv_123abc",
  "fileAttachments": [
    {
      "type": "image",
      "name": "screenshot.png",
      "base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    }
  ],
  "userPersonalization": {
    "tone": "friendly",
    "nickname": "Alex",
    "occupation": "Software Engineer",
    "customInstructions": "Provide code examples when relevant"
  }
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | ✅ Yes | User's chat message (1-5000 chars) |
| `conversationId` | string | ✅ Yes | Unique conversation identifier |
| `fileAttachments` | array | ❌ No | Array of file objects |
| `userPersonalization` | object | ❌ No | User preferences and settings |

**File Attachment Object:**
```json
{
  "type": "image" | "pdf" | "document" | "text",
  "name": "filename.ext",
  "base64": "base64_encoded_content"
}
```

**User Personalization Object:**
```json
{
  "tone": "professional" | "friendly" | "casual" | "formal",
  "nickname": "string",
  "occupation": "string",
  "customInstructions": "string"
}
```

#### Response

**Headers:**
```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**SSE Format:**
```
data: {"type":"chunk","content":"The capital"}
data: {"type":"chunk","content":" of France"}
data: {"type":"chunk","content":" is Paris"}
data: {"type":"done","usage":{"prompt_tokens":25,"completion_tokens":8}}
```

**Event Types:**

| Type | Description |
|------|-------------|
| `chunk` | Streaming content chunk |
| `done` | Response complete with usage stats |
| `error` | Error occurred during processing |

#### Status Codes

| Code | Meaning |
|------|---------|
| `200` | Stream started successfully |
| `400` | Invalid request body |
| `401` | Missing or invalid authentication token |
| `403` | User not authorized to perform action |
| `429` | Rate limit exceeded |
| `500` | Server error |

#### Response Example

**Success (Streaming):**
```javascript
// Client-side usage
const eventSource = new EventSource('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: 'Hello!',
    conversationId: 'conv_123'
  }),
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
});

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'chunk') {
    console.log(data.content);
  } else if (data.type === 'done') {
    console.log('Complete! Tokens used:', data.usage);
  }
};

eventSource.onerror = () => {
  console.error('Stream error');
  eventSource.close();
};
```

---

## Error Handling

### Error Response Format

```json
{
  "type": "error",
  "error": {
    "code": "INVALID_MESSAGE",
    "message": "Message exceeds maximum length"
  }
}
```

### Common Error Codes

| Code | Status | Description | Solution |
|------|--------|-------------|----------|
| `UNAUTHORIZED` | 401 | Invalid auth token | Reauthenticate user |
| `INVALID_MESSAGE` | 400 | Message validation failed | Check message format and length |
| `FILE_TOO_LARGE` | 400 | File exceeds size limit (25MB) | Use smaller files |
| `UNSUPPORTED_FILE_TYPE` | 400 | File type not supported | Use PDF, images, or text |
| `RATE_LIMITED` | 429 | Too many requests | Wait before retrying |
| `QUOTA_EXCEEDED` | 403 | Daily message limit reached | Reset at midnight UTC |
| `AI_ERROR` | 500 | AI service error | Retry after 30 seconds |
| `DATABASE_ERROR` | 500 | Firestore error | Contact support |

---

## Rate Limiting

### Limits

**Per User:**
- 100 messages per day (UTC)
- 10 concurrent requests maximum
- 60 requests per minute

**Per Endpoint:**
- 1000 requests per minute per API key
- Connection timeout: 60 seconds

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1704067200
```

**Response on Rate Limit (429):**
```json
{
  "type": "error",
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "retryAfter": 60
  }
}
```

---

## Examples

### Example 1: Simple Chat Message

**Request:**
```bash
curl -X POST https://eimemes-chat-ai.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -d '{
    "message": "Hello, how can you help me?",
    "conversationId": "conv_abc123"
  }'
```

**Response:**
```
data: {"type":"chunk","content":"Hello!"}
data: {"type":"chunk","content":" I can help you with"}
data: {"type":"chunk","content":" various tasks"}
data: {"type":"done","usage":{"prompt_tokens":10,"completion_tokens":7}}
```

### Example 2: With File Attachment

**Request:**
```json
{
  "message": "Can you analyze this document?",
  "conversationId": "conv_def456",
  "fileAttachments": [
    {
      "type": "pdf",
      "name": "report.pdf",
      "base64": "JVBERi0xLjQKJeLj..."
    }
  ]
}
```

### Example 3: With Personalization

**Request:**
```json
{
  "message": "Write me a code snippet",
  "conversationId": "conv_ghi789",
  "userPersonalization": {
    "tone": "professional",
    "nickname": "Dev",
    "occupation": "Full Stack Developer",
    "customInstructions": "Use TypeScript and React patterns"
  }
}
```

### Example 4: JavaScript/TypeScript Client

```typescript
interface ChatRequest {
  message: string;
  conversationId: string;
  fileAttachments?: FileAttachment[];
  userPersonalization?: UserPersonalization;
}

async function sendMessage(
  request: ChatRequest,
  idToken: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += new TextDecoder().decode(value);
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.type === 'chunk') {
          onChunk(data.content);
        } else if (data.type === 'done') {
          console.log('Complete', data.usage);
        }
      }
    }
  }
}
```

---

## Security Notes

- All API calls require Firebase authentication
- File attachments are processed in-memory only (never persisted)
- API keys are validated server-side
- CORS is enabled only for verified domains
- HTTPS is required for all requests
- System prompt is protected with n-gram fingerprinting

---

## Support

For issues or questions:
- Check the [README.md](README.md)
- Review [GitHub Issues](https://github.com/michaelkilong/EimemesChat-React/issues)
- Contact [@michaelkilong](https://github.com/michaelkilong)
