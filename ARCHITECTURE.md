# System Architecture

Technical architecture and design patterns used in EimemesChat AI.

---

## 📋 Table of Contents

- [High-Level Architecture](#high-level-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Flow](#data-flow)
- [Authentication Flow](#authentication-flow)
- [Database Schema](#database-schema)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         React 18 + TypeScript SPA                   │    │
│  │  (Components, Hooks, Context, Tailwind CSS)        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ HTTPS
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌──────────────────┐          ┌──────────────────┐
│ Firebase Auth    │          │ Firebase         │
│ (Google Sign-In) │          │ Firestore        │
└──────────────────┘          │ (Database)       │
                              └──────────────────┘
        ▲                                 ▲
        │                                 │
        └────────────────┬────────────────┘
                         │
                         │ HTTPS
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌──────────────────┐          ┌──────────────────┐
│  Vercel          │          │ AI Services      │
│  Serverless      │◄────────►│ - Groq LLM       │
│  Functions       │          │ - Google Gemini  │
│  (/api/chat)     │          └──────────────────┘
└──────────────────┘
```

---

## Frontend Architecture

### Technology Stack

```
React 18                 ─ UI framework with hooks
TypeScript 5.2          ─ Static type checking
Vite 5.0                ─ Build tool & dev server
Tailwind CSS 3.4        ─ Utility-first CSS framework
Firebase SDK 10.7       ─ Auth, Firestore, utilities
Highlight.js 11.9       ─ Code syntax highlighting
Marked 11.1             ─ Markdown parsing
KaTeX 0.16              ─ Math equation rendering
```

### Component Structure

```
src/
├── components/
│   ├── ChatInterface/       # Main chat UI component
│   ├── MessageList/         # Message display with formatting
│   ├── InputArea/           # User input & file upload
│   ├── Sidebar/             # Conversation history
│   ├── SettingsPanel/       # User preferences
│   ├── FilePreview/         # Attachment preview
│   └── ThemeToggle/         # Dark/Light mode
├── hooks/
│   ├── useAuth/             # Authentication logic
│   ├── useChat/             # Chat state management
│   ├── useFirestore/        # Database operations
│   └── useLocalStorage/     # Persistent storage
├── context/
│   ├── AppContext.tsx       # Global app state
│   └── AuthContext.tsx      # Auth state & user info
├── lib/
│   ├── markdown.ts          # Markdown utilities
│   ├── fileReader.ts        # File parsing utilities
│   └── utils.ts             # Helper functions
├── types.ts                 # TypeScript interfaces
├── styles/                  # Global CSS & variables
└── App.tsx                  # Root component
```

### State Management

**Global State (AppContext):**
```typescript
interface AppState {
  user: User | null;
  conversations: Conversation[];
  currentConversationId: string;
  theme: 'light' | 'dark';
  userPreferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
}
```

**Local State:**
- Component-level state managed with `useState`
- UI state (modals, dropdowns) kept local to components
- Heavy lifting delegated to custom hooks

### Data Flow

```
User Input
    │
    ▼
Component Event Handler
    │
    ▼
Context Action / Hook
    │
    ▼
Firestore / API Request
    │
    ▼
Response Processing
    │
    ▼
State Update
    │
    ▼
Component Re-render
```

---

## Backend Architecture

### Serverless Functions

Located in `/api` directory (Vercel Functions):

```
api/
└── chat.js              # Main AI chat endpoint
```

### Function Flow: `/api/chat`

```
HTTP POST Request (with auth token)
    │
    ▼
Verify Firebase Auth Token
    │
    ▼
Validate Request Body
    │
    ▼
Check Rate Limits & Quotas
    │
    ▼
Process File Attachments (if any)
    │
    ▼
Build Prompt with System Instructions
    │
    ▼
Call AI Service (Groq or Gemini)
    │
    ▼
Stream Response via SSE
    │
    ▼
Save Message to Firestore
    │
    ▼
Update User Statistics
```

### AI Service Selection

```typescript
interface AIConfig {
  service: 'groq' | 'gemini';
  model: string;
  maxTokens: number;
  temperature: number;
}

// Service routing logic:
if (usecase === 'fast-response') {
  return { service: 'groq', model: 'llama-3.3-70b-versatile' };
} else if (usecase === 'image-analysis') {
  return { service: 'gemini', model: 'gemini-2.5-flash-lite' };
}
```

---

## Data Flow

### Chat Message Flow

```
1. User Types Message
   │
2. Frontend validates input
   │
3. Message sent to /api/chat with auth token
   │
4. Backend receives request
   │
5. Verify Firebase Auth token
   │
6. Check user quotas & rate limits
   │
7. Build prompt with:
   - System instructions (shield.js)
   - User personalization
   - Conversation context
   - File attachments (if any)
   │
8. Stream to AI service
   │
9. Stream response back to client via SSE
   │
10. Save message pair to Firestore
    (conversationId/messages collection)
   │
11. Update user stats in Firestore
    │
12. Client updates UI in real-time
```

### Message Storage Structure

```
Firestore: /conversations/{conversationId}
├── messages/ (subcollection)
│   ├── {messageId}
│   │   ├── role: "user" | "assistant"
│   │   ├── content: string
│   │   ├── attachments: Array<Attachment>
│   │   ├── timestamp: number
│   │   └── tokens: { input: number, output: number }
│   │
│   └── {messageId2}
│       └── ... (another message)
│
└── metadata
    ├── createdAt: timestamp
    ├── updatedAt: timestamp
    ├── title: string
    └── userId: string
```

---

## Authentication Flow

### User Sign-In

```
1. User clicks "Sign in with Google"
   │
2. Firebase Auth redirect to Google OAuth
   │
3. User authenticates with Google
   │
4. Google redirects back with auth code
   │
5. Firebase SDK exchanges for ID token + JWT
   │
6. Token stored in localStorage
   │
7. App state updated with user info
   │
8. User uid derived from Firebase auth
```

### Request Authentication

```
Frontend Request:
├── Authorization: Bearer <idToken>
└── Body: { message, conversationId, ... }
    │
    ▼
Backend Verification:
├── Extract token from header
├── Verify token signature with Firebase public keys
├── Extract user uid from token claims
├── Check token expiration
├── Verify user has Firestore access
    │
    ▼
If Valid:
└── Proceed with request
    
If Invalid:
└── Return 401 Unauthorized
```

---

## Database Schema

### Firestore Collections

```
users/
├── {userId}
│   ├── email: string
│   ├── name: string
│   ├── photoURL: string
│   ├── createdAt: timestamp
│   ├── preferences
│   │   ├── theme: "light" | "dark"
│   │   ├── tone: string
│   │   └── nickname: string
│   └── statistics
│       ├── totalMessages: number
│       ├── totalTokens: number
│       └── lastMessageAt: timestamp

conversations/
├── {conversationId}
│   ├── userId: string (FK)
│   ├── title: string
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── messages/ (subcollection)
│       ├── {messageId}
│       │   ├── role: "user" | "assistant"
│       │   ├── content: string
│       │   ├── timestamp: timestamp
│       │   └── tokens: { input, output }
│       │
│       └── {messageId2}
│           └── ...

fileAttachments/
├── {attachmentId}
│   ├── userId: string (FK)
│   ├── conversationId: string (FK)
│   ├── messageId: string (FK)
│   ├── name: string
│   ├── type: "image" | "pdf" | "document"
│   ├── size: number
│   ├── uploadedAt: timestamp
│   └── metadata
│       ├── width: number (for images)
│       ├── height: number (for images)
│       └── pages: number (for PDFs)
```

### Firestore Security Rules

```
Key Principles:
1. Users can only read/write their own data
2. Conversations require userId verification
3. Messages can only be created by conversation owner
4. Real-time sync enabled for active conversations
5. Archived data retention: 90 days
6. Indexes on userId, createdAt for performance
```

---

## Security Architecture

### Defense Layers

```
1. Frontend Layer
   ├── Input validation
   ├── Message size limits
   ├── XSS prevention (React auto-escape)
   └── CSRF tokens for forms

2. API Layer
   ├── Firebase Auth token verification
   ├── Rate limiting (requests/minute)
   ├── Quota checking (messages/day)
   └── Input sanitization

3. System Prompt Layer
   ├── shield.js protection
   ├── N-gram fingerprinting
   └── Prompt injection detection

4. Database Layer
   ├── Firestore security rules
   ├── Per-user access control
   ├── Row-level security (RLS)
   └── Encryption at rest

5. Infrastructure Layer
   ├── HTTPS/TLS encryption in transit
   ├── DDoS protection (Vercel)
   ├── WAF rules (Vercel)
   └── Private API keys (never exposed)
```

### Sensitive Data Handling

```
API Keys:
├── Stored in Vercel environment variables
├── Never committed to git
├── Rotated regularly
└── Never sent to frontend

User Data:
├── Encrypted in Firestore
├── Access controlled by security rules
├── Retained per privacy policy
└── Deletion on account termination

File Attachments:
├── Processed in-memory only
├── Never stored on disk
├── Validated before processing
└── Size-limited (25MB max)

Auth Tokens:
├── Generated by Firebase
├── Verified server-side
├── Short-lived (1 hour)
└── Refresh tokens handled by SDK
```

---

## Deployment Architecture

### Vercel Deployment

```
GitHub Repository
    │
    ▼ (Push to main)
Vercel Build Pipeline
    ├─ npm install
    ├─ npm run build (TypeScript compilation)
    └─ npm run preview
    │
    ▼ (On Success)
Generate Deployment
    ├─ Static assets → Edge Network
    ├─ API functions → Serverless region
    └─ Environment variables loaded
    │
    ▼
Live at https://eimemes-chat-ai.vercel.app
    ├─ Frontend served from CDN
    ├─ API routes available
    └─ Real-time updates via Firestore
```

### Environment Setup

```
Production (.env on Vercel):
├── FIREBASE_PROJECT_ID=...
├── FIREBASE_CLIENT_EMAIL=...
├── FIREBASE_PRIVATE_KEY=...
├── GROQ_API_KEY=...
└── GEMINI_API_KEY=...

Development (.env.local):
├── VITE_FIREBASE_API_KEY=...
├── VITE_FIREBASE_AUTH_DOMAIN=...
├── VITE_FIREBASE_PROJECT_ID=...
└── (same structure, local values)
```

### Build Process

```
1. Source code pulled from GitHub
2. Dependencies installed (npm install)
3. TypeScript compiled & type-checked (npm run build)
4. Tailwind CSS purged & optimized
5. Vite bundles and minifies assets
6. Serverless functions prepared
7. Deployment to global CDN
8. SSL/TLS certificates auto-managed
```

---

## Performance Considerations

### Optimization Strategies

```
Frontend:
├─ Code splitting by route
├─ Image lazy loading
├─ CSS minification via Tailwind
├─ Tree-shaking of unused imports
└─ Service worker caching

Backend:
├─ Streaming responses (SSE)
├─ Connection pooling to AI services
├─ Request batching where possible
└─ Cache layer for frequent queries

Database:
├─ Firestore indexes on hot queries
├─ Compound indexes for complex filters
├─ Pagination for large result sets
└─ Real-time listeners only for active chats
```

### Monitoring & Observability

```
Vercel Analytics:
├─ Response times
├─ Error rates
├─ Request frequency
└─ Resource usage

Application Metrics:
├─ Message processing time
├─ Token usage per request
├─ File upload sizes
└─ User retention rate
```

---

## Scalability Notes

### Current Bottlenecks

1. **Firebase Firestore**: 
   - Write capacity: ~10k/second
   - Read capacity: ~100k/second
   - Current usage well below limits

2. **AI Services**:
   - Groq rate limit: Depends on plan
   - Gemini rate limit: Depends on plan
   - Consider queue system for high volume

3. **Vercel Functions**:
   - Cold start time: ~0.5-1s (first request)
   - Execution timeout: 60 seconds
   - Memory: 1024 MB per function

### Scaling Recommendations

```
To handle 10x traffic:

1. Firestore
   ├─ Enable auto-scaling
   ├─ Add read replicas in other regions
   └─ Consider sharding conversations

2. API Services
   ├─ Implement request queue (Bull, RabbitMQ)
   ├─ Add response caching layer (Redis)
   └─ Load balance across AI providers

3. Functions
   ├─ Increase concurrency settings
   ├─ Implement HTTP/2 Server Push
   └─ Consider Edge Functions for lower latency
```

---

## References

- [React Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Functions Guide](https://vercel.com/docs/functions)
- [Groq API Documentation](https://console.groq.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
