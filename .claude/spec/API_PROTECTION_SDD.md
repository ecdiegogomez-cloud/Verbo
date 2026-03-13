# Software Design Document (SDD) - API Protection
# Wedding Speech Savior (Verbo)

**Version:** 1.0
**Date:** March 12, 2026
**Author:** Diego Gomez-Juan
**Status:** Active

---

## 1. Introduction

### 1.1 Purpose

This document describes the implementation of API endpoint protection for the Wedding Speech Savior application. It details the security measures implemented to prevent unauthorized access to the AI generation endpoints.

### 1.2 Scope

This document covers:
- Middleware-based API protection
- Authentication and authorization mechanisms
- Environment variable configuration
- Development vs production behavior
- Implementation steps taken

### 1.3 Problem Statement

The API endpoints (`/api/generate` and `/api/interview`) were publicly accessible without any authentication. This exposed the application to:
- Unauthorized external access
- Potential API abuse
- Cost implications from excessive API calls

---

## 2. Implementation Steps

### 2.1 Files Modified

| File | Description | Lines Changed |
|------|-------------|---------------|
| `middleware.ts` | Added API protection logic | Modified |
| `.env.local` | Added `API_SECRET_KEY` variable | Added |
| `.env.local.example` | Created template with documentation | Created |

### 2.2 Files Created

| File | Description |
|------|-------------|
| `.env.local.example` | Environment variable template |

### 2.3 Files Deleted

| File | Reason |
|------|--------|
| `lib/auth.ts` | No longer needed - middleware handles auth |

---

## 3. Technical Implementation

### 3.1 Middleware Design

**File:** `middleware.ts`

The middleware now serves dual purposes:
1. **i18n routing** (existing functionality via `next-intl`)
2. **API authentication** (new functionality)

**Code Structure:**

```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const i18nMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Handle API routes protection
    if (pathname.startsWith('/api/')) {
        // Skip authentication if API_SECRET_KEY is not configured (dev mode)
        if (!process.env.API_SECRET_KEY ||
            process.env.API_SECRET_KEY === 'change-me-to-a-secure-random-key') {
            return NextResponse.next();
        }

        const apiKey = request.headers.get('x-api-key');

        // Allow requests from same origin by checking the referer
        const referer = request.headers.get('referer');
        const origin = request.headers.get('origin');
        const host = request.headers.get('host');
        const protocol = request.nextUrl.protocol === 'https:' ? 'https:' : 'http:';

        // Check if request comes from the same site
        const isSameOrigin =
            referer?.startsWith(`${protocol}//${host}`) ||
            origin?.startsWith(`${protocol}//${host}`);

        // Allow if API key matches or if it's a same-origin request
        if (apiKey === process.env.API_SECRET_KEY || isSameOrigin) {
            return NextResponse.next();
        }

        // Reject unauthorized requests
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    // Handle i18n for non-API routes
    return i18nMiddleware(request);
}

export const config = {
    matcher: [
        // Match API routes
        '/api/:path*',
        // Match i18n routes
        '/',
        '/(en|es)/:path*',
    ],
};
```

### 3.2 Configuration

**File:** `.env.local`

```bash
# Gemini AI API Key
# Get yours at: https://aistudio.google.com/apikey
GEMINI_API_KEY=AIzaSyCoHA7LguiJ7CiQ5FwybjBFdQ3bayeIyGI

# Secret API key for protecting your API endpoints
# Generate a secure random key for production use
API_SECRET_KEY=change-me-to-a-secure-random-key
```

**File:** `.env.local.example` (New)

```bash
# Gemini AI API Key
# Get yours at: https://aistudio.google.com/apikey
GEMINI_API_KEY=your-gemini-api-key-here

# Secret API key for protecting your API endpoints
# Generate a secure random key for production use
# This protects your APIs from external access
API_SECRET_KEY=change-me-to-a-secure-random-key
```

---

## 4. Security Architecture

### 4.1 Request Flow Diagram

```
┌─────────────────┐
│ Client Request │
│ (Browser/App)  │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│         Next.js Middleware               │
│  ┌─────────────────────────────────────┐│
│  │ 1. Check if path starts with /api/  ││
│  │ 2. Check if API_SECRET_KEY is set   ││
│  │ 3. Extract headers:                  ││
│  │    - x-api-key                       ││
│  │    - referer                         ││
│  │    - origin                          ││
│  │ 4. Validate request:                 ││
│  │    ├─ API key matches? → ALLOW      ││
│  │    ├─ Same origin? → ALLOW           ││
│  │    └─ Otherwise → DENY (401)         ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
         │
         ↓ ALLOWED
┌─────────────────────────────────────────┐
│         API Route Handler               │
│  (/api/generate or /api/interview)     │
└─────────────────────────────────────────┘
```

### 4.2 Authentication Modes

#### Development Mode

| Condition | Behavior |
|-----------|----------|
| `API_SECRET_KEY` is unset | All requests allowed |
| `API_SECRET_KEY` equals default value | All requests allowed |
| Purpose | Local development without friction |

#### Production Mode

| Condition | Behavior |
|-----------|----------|
| `API_SECRET_KEY` is set to secure value | Authentication enforced |
| `x-api-key` header matches | Request allowed |
| Referer/Origin matches host | Request allowed |
| Neither condition met | Returns 401 Unauthorized |

### 4.3 Response Codes

| Status | Condition | Response Body |
|--------|-----------|---------------|
| 200 | Valid request | API response |
| 401 | Unauthorized access | `{"error": "Unauthorized"}` |

---

## 5. Protected Endpoints

### 5.1 POST /api/generate

**Purpose:** Generate wedding speeches using AI

**Protection:** Middleware validates before route handler execution

### 5.2 POST /api/interview

**Purpose:** Conduct conversational interview with AI

**Protection:** Middleware validates before route handler execution

---

## 6. Deployment Instructions

### 6.1 Local Development

1. Keep `API_SECRET_KEY` as default value or unset
2. No additional configuration required
3. All API requests will be allowed

### 6.2 Production Deployment

1. Generate a secure random key:
   ```bash
   # Example using OpenSSL
   openssl rand -base64 32
   ```

2. Set the environment variable:
   ```bash
   API_SECRET_KEY=<your-secure-random-key>
   ```

3. Deploy with the variable set in your platform's environment settings

### 6.3 Platform-Specific Configuration

| Platform | Environment Variable Location |
|----------|------------------------------|
| Vercel | Project Settings → Environment Variables |
| Netlify | Site Settings → Environment Variables |
| Railway | Variables Tab |
| Docker | `-e API_SECRET_KEY=...` flag or `.env` file |

---

## 7. Testing

### 7.1 Testing Development Mode

```bash
# Should succeed (no auth required)
curl -X POST https://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"relationship":"bestMan","coupleNames":"Jane & John","tone":"heartfelt","duration":"medium","speechLang":"en"}'
```

### 7.2 Testing Production Mode

```bash
# Test without auth - should fail
curl -X POST https://your-domain.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{"relationship":"bestMan","coupleNames":"Jane & John","tone":"heartfelt","duration":"medium","speechLang":"en"}'
# Response: {"error":"Unauthorized"} (401)

# Test with API key - should succeed
curl -X POST https://your-domain.com/api/generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secure-random-key" \
  -d '{"relationship":"bestMan","coupleNames":"Jane & John","tone":"heartfelt","duration":"medium","speechLang":"en"}'
```

### 7.3 Testing Same-Origin Access

Same-origin requests (from the website) will succeed automatically without the API key header.

---

## 8. Security Considerations

### 8.1 Strengths

| Aspect | Description |
|--------|-------------|
| Same-Origin Validation | Prevents CSRF from external domains |
| Server-Side Validation | Keys never exposed to client |
| Development Mode | Seamless local development |
| Header-Based Auth | Standard approach for API access |

### 8.2 Limitations

| Limitation | Mitigation |
|------------|------------|
| Referer header can be spoofed | Use for production only |
| No rate limiting | Consider adding rate limiting middleware |
| No user authentication | For future enhancement |

### 8.3 Recommendations

1. **For production:** Use a strong, randomly generated `API_SECRET_KEY`
2. **For programmatic access:** Include the `x-api-key` header in your client
3. **Future enhancements:**
   - Add rate limiting to prevent abuse
   - Implement CORS configuration
   - Add user authentication for multi-tenant scenarios

---

## 9. Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-03-12 | Initial API protection SDD | Diego Gomez-Juan |

---

**End of SDD - API Protection**
