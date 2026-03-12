# Software Design Document (SDD)
# Wedding Speech Savior (Verbo)

**Version:** 1.0
**Date:** March 12, 2026
**Author:** Diego Gomez-Juan
**Status:** Active

---

## 1. Introduction

### 1.1 Purpose

This Software Design Document (SDD) provides the technical specifications and design details for the Wedding Speech Savior application. It describes the system architecture, components, interfaces, data structures, and algorithms used in the implementation.

### 1.2 Scope

This document covers:
- System architecture and design patterns
- Component specifications
- API interface definitions
- Data models and structures
- Security considerations
- Deployment configuration

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| SDD | Software Design Document |
| DDS | Design Document Specification |
| API | Application Programming Interface |
| i18n | Internationalization |
| TTS | Text-to-Speech |
| AI | Artificial Intelligence |
| LLM | Large Language Model |
| CSR | Client-Side Rendering |
| SSR | Server-Side Rendering |

---

## 2. System Architecture

### 2.1 Architectural Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client Layer                              │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                  Next.js Frontend (App Router)            │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐           │   │
│  │  │ Conversa-  │  │ Interview  │  │  Speech    │           │   │
│  │  │ tionalForm │  │   Chat     │  │   Result   │           │   │
│  │  └────────────┘  └────────────┘  └────────────┘           │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────────────┐
│                       Server Layer (Next.js)                       │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    API Routes (Serverless)                 │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │  POST /api/generate                                 │  │   │
│  │  │  POST /api/interview                                │  │   │
│  │  └─────────────────────────────────────────────────────┘  │   │
│  │                                                             │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │  Business Logic Layer (lib/)                        │  │   │
│  │  │  • ai.ts - AI Client                                 │  │   │
│  │  │  • prompts.ts - Prompt Builders                      │  │   │
│  │  │  • interview-prompts.ts - Interview Logic            │  │   │
│  │  │  • examples.ts - Reference Examples                │  │   │
│  │  └─────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ↓ HTTPS
┌─────────────────────────────────────────────────────────────────────┐
│                     External Services Layer                         │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              Google Generative AI (Gemini 2.5 Flash)       │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Design Patterns

| Pattern | Description | Location |
|---------|-------------|----------|
| **Component Pattern** | React components with clear single responsibility | `components/` |
| **Serverless Functions** | Next.js API Routes for backend logic | `app/api/` |
| **Factory Pattern** | `buildPrompt()` and `buildInterviewSystemPrompt()` | `lib/prompts.ts`, `lib/interview-prompts.ts` |
| **Singleton Pattern** | Google AI client reuse | `lib/ai.ts` |
| **Observer Pattern** | React state updates trigger re-renders | All components |
| **Strategy Pattern** | Different prompt strategies for EN/ES | `lib/prompts.ts` |

### 2.3 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 16.1.6 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 4 |
| AI Service | Google Generative AI SDK | 0.24.1 |
| Document Generation | docx | 9.6.0 |
| Icons | Lucide React | 0.564.0 |
| i18n | next-intl | 4.8.2 |

---

## 3. Component Design

### 3.1 Component Hierarchy

```
App (app/[locale]/generator/page.tsx)
├── Header (components/Header.tsx)
├── ConversationalForm (components/ConversationalForm.tsx)
├── InterviewChat (components/InterviewChat.tsx)
├── SpeechResult (components/SpeechResult.tsx)
└── Footer (components/Footer.tsx)
```

### 3.2 Component Specifications

#### 3.2.1 ConversationalForm

```typescript
interface ConversationalFormProps {
    onGenerate: (data: FormData) => void;
    isLoading: boolean;
    locale: string;
}

interface FormData {
    relationship: string;
    relationshipTarget: string;
    coupleNames: string;
    speakerName: string;
    tone: string;
    duration: string;
    speechLang: string;
}
```

**State Management:**
- Local component state using `useState`
- Real-time validation on form submission

**Input Options:**

| Field | Options |
|-------|---------|
| relationship | bestMan, maidOfHonor, father, mother, sibling, friend, other |
| tone | heartfelt, funny, formal, mix, witty, straightforward, celebratory |
| duration | short, medium, long |
| speechLang | en, es |

**Validation Logic:**
```typescript
const isValid =
    form.relationship &&
    form.coupleNames &&
    form.speakerName &&
    form.tone &&
    form.duration &&
    form.speechLang &&
    (!showTarget || form.relationshipTarget);
```

#### 3.2.2 InterviewChat

```typescript
interface InterviewChatProps {
    formData: InterviewFormData;
    onComplete: (transcript: string) => void;
}

interface InterviewFormData {
    relationship: string;
    relationshipTarget: string;
    coupleNames: string;
    speakerName: string;
    tone: string;
    speechLang: string;
}
```

**State Management:**
```typescript
interface State {
    messages: ChatMessage[];
    inputValue: string;
    isAiTyping: boolean;
    isComplete: boolean;
    error: string;
    aiTurnCount: number;
}
```

**Key Algorithms:**

1. **Auto-start on mount:**
```typescript
useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    fetchAiResponse([]);
}, []);
```

2. **Streaming response handling:**
```typescript
while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    aiText += chunk;
    setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'model', content: aiText };
        return updated;
    });
}
```

#### 3.2.3 SpeechResult

```typescript
interface SpeechResultProps {
    speech: string;
    onRegenerate: () => void;
    onNewSpeech: () => void;
    isLoading: boolean;
    speakerName?: string;
    coupleNames?: string;
}
```

**DOCX Generation Algorithm:**

```typescript
const handleDownload = async () => {
    // 1. Title-case the names
    const displayCouple = coupleNames ? toTitle(coupleNames) : 'Wedding Speech';
    const displaySpeaker = speakerName ? toTitle(speakerName) : null;

    // 2. Build document structure
    const paragraphs: Paragraph[] = [];

    // 2a. Header: VERBO brand
    paragraphs.push(/* VERBO text with gold color */);

    // 2b. Gold separator line
    paragraphs.push(/* decorative line */);

    // 2c. Couple names (title)
    paragraphs.push(/* couple names, bold, large */);

    // 2d. Speaker name (subtitle)
    if (displaySpeaker) {
        paragraphs.push(/* speaker name, italic, grey */);
    }

    // 2e. Ornament separator
    paragraphs.push(/* — ✦ — ornament */);

    // 2f. Speech body (paragraph by paragraph)
    const lines = speech.split('\n');
    for (const line of lines) {
        paragraphs.push(/* line with Georgia font, justified */);
    }

    // 2g. Footer elements
    paragraphs.push(/* gold separator line + brand footer */);

    // 3. Create and download document
    const doc = new Document({ sections: [{ children: paragraphs }] });
    const blob = await Packer.toBlob(doc);
    // ... download logic
};
```

**DOCX Styling Specifications:**

| Element | Font | Size | Color | Style |
|---------|------|------|-------|-------|
| Brand (VERBO) | Georgia | 9pt | #b8860b (gold) | Normal, spacing |
| Separator line | Georgia | 7pt | #b8860b | Normal |
| Couple names | Georgia | 20pt | #1a1a1a | Bold |
| Speaker name | Georgia | 10pt | #888888 | Italic |
| Ornament | Georgia | 11pt | #b8860b | Normal |
| Speech body | Georgia | 12pt | #1a1a1a | Normal |
| Footer | Georgia | 8pt | #b8860b | Italic |

---

## 4. API Interface Design

### 4.1 POST /api/generate

**Endpoint:** `/api/generate`
**Method:** `POST`
**Content-Type:** `application/json`

**Request Schema:**
```typescript
interface GenerateRequest {
    relationship: string;        // required
    relationshipTarget?: string;
    coupleNames: string;          // required
    speakerName?: string;
    tone: string;                // required
    anecdotes: string;           // required
    duration: string;            // required
    speechLang: string;           // required
}
```

**Response:**
- **Type:** `text/plain; charset=utf-8`
- **Encoding:** `chunked` (streaming)

**Error Responses:**

| Status | Description | Body |
|--------|-------------|------|
| 400 | Missing required fields | `{"error": "Missing required fields"}` |
| 500 | Generation failed | `{"error": "<error message>"}` |

**Processing Flow:**
```
1. Parse JSON request body
2. Validate required fields
3. Build prompt using buildPrompt()
4. Call generateSpeech() from lib/ai.ts
5. Stream response back to client
```

### 4.2 POST /api/interview

**Endpoint:** `/api/interview`
**Method:** `POST`
**Content-Type:** `application/json`

**Request Schema:**
```typescript
interface InterviewRequest {
    messages: ChatMessage[];
    formData: InterviewFormData;
}

interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

interface InterviewFormData {
    relationship: string;
    relationshipTarget?: string;
    coupleNames: string;
    speakerName: string;
    tone: string;
    speechLang: string;
}
```

**Response:**
- **Type:** `text/plain; charset=utf-8`
- **Encoding:** `chunked` (streaming)

**Error Responses:**

| Status | Description | Body |
|--------|-------------|------|
| 400 | Missing formData or interview complete | `{"error": "<message>"}` |
| 500 | API error | `{"error": "<error message>"}` |

**Business Rules:**

1. **Turn Limit:** Maximum 6 AI turns per interview
2. **API Key Validation:** Must have valid `GEMINI_API_KEY` in environment
3. **Last Turn Handling:** Special message appended to prompt on final turn

**Processing Flow:**
```
1. Parse JSON request body
2. Validate formData fields
3. Check API key availability
4. Count existing AI turns
5. If >= MAX_AI_TURNS, return error
6. Initialize Gemini model with system prompt
7. Build chat history
8. Append system note if last turn
9. Send message and stream response
```

---

## 5. Data Models and Structures

### 5.1 Core Data Types

#### 5.1.1 SpeechInput
```typescript
export interface SpeechInput {
    relationship: string;
    relationshipTarget?: string;
    coupleNames: string;
    speakerName?: string;
    tone: string;
    anecdotes: string;
    duration: string;
    speechLang: string;
}
```

#### 5.1.2 InterviewFormData
```typescript
export interface InterviewFormData {
    relationship: string;
    relationshipTarget?: string;
    coupleNames: string;
    speakerName: string;
    tone: string;
    speechLang: string;
}
```

#### 5.1.3 ChatMessage
```typescript
export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}
```

### 5.2 Configuration Constants

#### 5.2.1 Duration Word Counts
```typescript
const DURATION_WORDS: Record<string, { min: number; max: number }> = {
    short: { min: 200, max: 350 },
    medium: { min: 400, max: 600 },
    long: { min: 650, max: 900 },
};
```

#### 5.2.2 Tone Descriptions
```typescript
const TONE_DESCRIPTIONS: Record<string, Record<string, string>> = {
    en: {
        heartfelt: 'warm and sincere — honest emotion...',
        funny: 'lighthearted and genuinely funny...',
        formal: 'respectful and composed...',
        mix: 'mostly warm and genuine...',
        witty: 'clever and sharp...',
        straightforward: 'direct and honest...',
        celebratory: 'upbeat and joyful...',
    },
    es: { /* Spanish equivalents */ }
};
```

#### 5.2.3 Role Labels
```typescript
const ROLE_LABELS: Record<string, Record<string, string>> = {
    en: {
        bestMan: 'best man',
        maidOfHonor: 'maid of honor',
        father: 'father of the bride/groom',
        mother: 'mother of the bride/groom',
        sibling: 'sibling',
        friend: 'close friend',
        other: 'guest',
    },
    es: { /* Spanish equivalents */ }
};
```

#### 5.2.4 Role Approaches
```typescript
const ROLE_APPROACH: Record<string, Record<string, string>> = {
    en: {
        bestMan: 'You\'re the groom\'s closest friend...',
        maidOfHonor: 'You\'re the bride\'s closest friend...',
        father: 'You\'re the parent watching your kid get married...',
        mother: 'You\'re the parent who knows them in ways nobody else does...',
        sibling: 'You grew up with them...',
        friend: 'You\'re a close friend...',
        other: 'You know this couple from your own unique angle...',
    },
    es: { /* Spanish equivalents */ }
};
```

---

## 6. Algorithms

### 6.1 Prompt Building Algorithm

```typescript
function buildPrompt(input: SpeechInput): string {
    // 1. Extract language
    const lang = input.speechLang || 'en';

    // 2. Get word count range
    const wordRange = DURATION_WORDS[input.duration] || DURATION_WORDS.medium;

    // 3. Get tone description
    const toneDesc = TONE_DESCRIPTIONS[lang]?.[input.tone] || TONE_DESCRIPTIONS.en.mix;

    // 4. Build role label
    const baseRoleLabel = ROLE_LABELS[lang]?.[input.relationship] || input.relationship;
    const roleLabel = input.relationshipTarget
        ? `${baseRoleLabel} ${lang === 'es' ? 'de' : 'of'} ${input.relationshipTarget}`
        : baseRoleLabel;

    // 5. Build role approach
    const baseRoleApproach = ROLE_APPROACH[lang]?.[input.relationship] || ROLE_APPROACH[lang]?.other || '';
    const roleApproach = input.relationshipTarget
        ? baseRoleApproach.replace(
            /the groom's|the bride's|del novio|de la novia|la novia\/novio|the bride\/groom/gi,
            input.relationshipTarget + (lang === 'es' ? '' : "'s")
        )
        : baseRoleApproach;

    // 6. Get reference example
    const exampleSpeech = getExampleForTone(input.tone, lang);

    // 7. Build prompt parameters
    const params: PromptParams = {
        roleLabel,
        roleApproach,
        coupleNames: coupleNamesFormatted(input.coupleNames),
        speakerName: input.speakerName?.trim() || '',
        toneDesc,
        wordRange,
        anecdotes: input.anecdotes,
        exampleSpeech,
    };

    // 8. Return language-specific prompt
    return lang === 'es' ? buildSpanishPrompt(params) : buildEnglishPrompt(params);
}
```

### 6.2 Interview Transcript to Anecdotes Algorithm

```typescript
export function transcriptToAnecdotes(messages: ChatMessage[]): string {
    // 1. Pair AI questions with user answers
    const pairs: string[] = [];
    let memoryIndex = 0;

    // 2. Iterate through messages
    for (let i = 0; i < messages.length; i++) {
        // 3. Find user messages
        if (messages[i].role === 'user') {
            memoryIndex++;

            // 4. Get preceding AI question if exists
            const question = i > 0 && messages[i - 1].role === 'model'
                ? messages[i - 1].content.trim()
                : '';

            // 5. Get user answer
            const answer = messages[i].content.trim();

            // 6. Format as Q&A pair or standalone memory
            pairs.push(
                question
                    ? `Memory ${memoryIndex}:\nQ: ${question}\nA: ${answer}`
                    : `Memory ${memoryIndex}: ${answer}`
            );
        }
    }

    // 7. Join pairs with double newlines
    return pairs.join('\n\n');
}
```

### 6.3 Interview Completion Detection

```typescript
// Count AI turns
const aiTurnCount = messages.filter((m) => m.role === 'model').length;

// Check if limit reached
if (aiTurnCount >= MAX_AI_TURNS) {
    return NextResponse.json({ error: 'Interview complete' }, { status: 400 });
}

// Determine if this is the last turn
const isLastTurn = aiTurnCount === MAX_AI_TURNS - 1;

// If last turn, append closing instruction
const messageToSend = isLastTurn
    ? `${lastMessage.content}\n\n[SYSTEM NOTE: This is the speaker's final answer. Do NOT ask another question. Respond with a brief, warm closing line acknowledging their answers and letting them know you have everything you need to write a great speech.]`
    : lastMessage.content;
```

---

## 7. Security Design

### 7.1 Threat Model

| Threat | Description | Mitigation |
|--------|-------------|------------|
| API Key Exposure | API key exposed in client code | Server-side API routes only |
| Prompt Injection | User manipulates system prompts | Structured prompt templates, system instruction priority |
| Rate Limiting Abuse | Excessive API calls | MAX_AI_TURNS limit per session |
| Content Abuse | Inappropriate content requests | System prompt safety guidelines |

### 7.2 Security Controls

#### 7.2.1 Environment Variables
```typescript
// API key never exposed to client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
}
```

#### 7.2.2 Input Validation
```typescript
// Required field validation
if (!body.relationship || !body.coupleNames || !body.tone || !body.duration || !body.speechLang) {
    return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
    );
}
```

#### 7.2.3 Error Handling
```typescript
// Generic error messages (no system details exposed)
catch (error) {
    console.error('Speech generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate speech';
    return NextResponse.json({ error: message }, { status: 500 });
}
```

### 7.3 Content Safety Guidelines (System Prompt)

The system prompt includes the following safety instructions:

```
## SAFETY

- Do not accept or promote content that is discriminatory, sexist, racist, or inappropriate for a wedding
- If user shares something that could be misinterpreted, focus on positive aspects of the story or kindly suggest a more constructive perspective
```

---

## 8. Internationalization Design

### 8.1 Locale Structure

```
messages/
├── en.json          # English translations
└── es.json          # Spanish translations
```

### 8.2 Translation Key Structure

```json
{
  "generator": {
    "title": "Create Your Wedding Speech",
    "relationshipLabel": "Your relationship to the couple",
    "coupleNamesLabel": "Couple names",
    "speakerNameLabel": "Your name",
    "toneLabel": "Tone",
    "durationLabel": "Duration",
    "speechLangLabel": "Speech language",
    "generate": "Continue"
  },
  "interview": {
    "title": "Tell me your stories",
    "inputPlaceholder": "Type your answer here...",
    "continueButton": "Generate my speech",
    "retry": "Try again"
  },
  "result": {
    "title": "Your speech is ready",
    "copy": "Copy",
    "copied": "Copied!",
    "download": "Download",
    "regenerate": "Regenerate",
    "newSpeech": "New speech",
    "tip": "Feel free to edit, personalize, or practice until it feels right."
  },
  "header": {
    "brand": "Verbo",
    "language": {
      "en": "English",
      "es": "Español"
    }
  },
  "footer": {
    "tagline": "Words for what you already feel"
  }
}
```

### 8.3 i18n Configuration

```typescript
// i18n/routing.ts
export const routing = {
    locales: ['en', 'es'] as const,
    defaultLocale: 'es' as const,
};

// i18n/request.ts
export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    if (!locale || !routing.locales.includes(locale as 'en' | 'es')) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
    };
});
```

---

## 9. Performance Considerations

### 9.1 Streaming Implementation

Both API endpoints use streaming for better UX:

```typescript
// Server-side streaming
const stream = new ReadableStream({
    async start(controller) {
        try {
            for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) controller.enqueue(encoder.encode(text));
            }
            controller.close();
        } catch (err) {
            controller.error(err);
        }
    },
});

// Client-side consumption
const reader = response.body?.getReader();
while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    // Process chunk
}
```

### 9.2 Optimization Strategies

| Strategy | Implementation |
|----------|----------------|
| Code Splitting | Next.js automatic code splitting by route |
| Image Optimization | Next.js Image component (if images added) |
| Font Optimization | Tailwind CSS included in bundle |
| Memoization | React callbacks with useCallback |
| Lazy Loading | Components load on demand |

---

## 10. Error Handling

### 10.1 Error Categories

| Category | HTTP Status | User Message |
|----------|-------------|--------------|
| Validation Error | 400 | "Missing required fields" / "Interview complete" |
| Configuration Error | 500 | "API key not configured" |
| API Error | 500 | "Failed to generate speech" / "Interview failed" |
| Network Error | N/A | Client-side retry UI |

### 10.2 Error Recovery

```typescript
// Client-side retry mechanism
{error && (
    <div className="clean-error">
        {error}
        <button className="clean-retry" onClick={() => fetchAiResponse(messages)}>
            {t('retry')}
        </button>
    </div>
)}
```

---

## 11. Deployment

### 11.1 Environment Variables

```bash
# .env.local
GEMINI_API_KEY=your_api_key_here
```

### 11.2 Build Configuration

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

### 11.3 Deployment Platforms

| Platform | Configuration |
|----------|---------------|
| Vercel | Add GEMINI_API_KEY in project settings |
| Netlify | Add GEMINI_API_KEY in environment variables |
| Railway | Add GEMINI_API_KEY in variables tab |

---

## 12. Testing Strategy

### 12.1 Recommended Test Coverage

| Component | Unit Tests | Integration Tests | E2E Tests |
|-----------|------------|-------------------|-----------|
| ConversationalForm | ✅ | ✅ | ✅ |
| InterviewChat | ✅ | ✅ | ✅ |
| SpeechResult | ✅ | ✅ | ✅ |
| /api/generate | - | ✅ | ✅ |
| /api/interview | - | ✅ | ✅ |
| lib/ai.ts | ✅ | ✅ | - |
| lib/prompts.ts | ✅ | - | - |
| lib/interview-prompts.ts | ✅ | - | - |

### 12.2 Test Scenarios

#### 12.2.1 Form Validation
- Submit empty form
- Submit partial form
- Submit valid form
- Parse couple names with different separators

#### 12.2.2 Interview Flow
- Auto-start on mount
- Send message successfully
- Handle empty message send
- Handle AI typing state
- Handle streaming updates
- Handle 6-turn limit
- Handle error and retry

#### 12.2.3 Speech Generation
- Generate with minimal data
- Generate with full data
- Handle streaming response
- Handle generation error

#### 12.2.4 DOCX Download
- Download without names
- Download with couple names
- Download with speaker name
- Verify document formatting

---

## 13. Future Enhancements

### 13.1 Technical Debt
- [ ] Add comprehensive test suite
- [ ] Implement error boundary components
- [ ] Add loading skeletons
- [ ] Optimize bundle size
- [ ] Add analytics integration

### 13.2 Features
- [ ] User authentication
- [ ] Save draft speeches
- [ ] Speech history
- [ ] Advanced customization options
- [ ] Multiple language support beyond EN/ES
- [ ] PDF export option
- [ ] Text-to-speech preview

---

## 14. References

### 14.1 External Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Google AI Docs](https://ai.google.dev/gemini-api/docs)
- [next-intl Docs](https://next-intl-docs.vercel.app/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [docx Docs](https://docx.js.org/)

### 14.2 Key Files

| File | Lines | Description |
|------|-------|-------------|
| `app/api/generate/route.ts` | 31 | Speech generation endpoint |
| `app/api/interview/route.ts` | 129 | Interview chat endpoint |
| `lib/ai.ts` | 45 | AI client implementation |
| `lib/prompts.ts` | 285 | Speech prompt builders |
| `lib/interview-prompts.ts` | 437 | Interview prompt builders |
| `components/InterviewChat.tsx` | 239 | Chat component |
| `components/SpeechResult.tsx` | 270 | Result component |
| `components/ConversationalForm.tsx` | 240 | Form component |

---

## 15. Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-03-12 | Initial SDD | Diego Gomez-Juan |

---

**End of SDD**
