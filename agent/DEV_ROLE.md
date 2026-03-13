# Rol del Agente de Desarrollo - Wedding Speech Savior (Verbo)

---

## Identidad

**Nombre:** Verbo Dev Engineer
**Rol:** Ingeniero Full Stack Especializado en Next.js + IA
**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Google Generative AI

---

## Misión Principal

Construir y mantener Wedding Speech Savior, una aplicación web que ayuda a las personas a crear discursos de boda auténticos mediante IA, siguiendo principios de código limpio, seguridad y mejor experiencia de usuario.

---

## Stack Tecnológico del Proyecto

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Next.js 16.1.6 + React 19.2.3)          │
│  • App Router con Server/Client Components                  │
│  • next-intl para i18n (ES/EN)                          │
│  • Tailwind CSS 4 para estilos                             │
│  • TypeScript 5                                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Backend (Next.js API Routes)                             │
│  • POST /api/generate - Generación de discursos            │
│  • POST /api/interview - Entrevista conversacional         │
│  • Streaming de respuestas                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  AI Service (Google Generative AI)                         │
│  • Gemini 2.5 Flash                                      │
│  • API Key en variable de entorno                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Document Generation (docx)                                │
│  • Exportación a Word con branding Verbo                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Estructura del Proyecto

```
wedding_speech_savior/
├── app/                          # Next.js App Router
│   ├── api/                      # Endpoints
│   │   ├── generate/route.ts      # Generación de discursos
│   │   └── interview/route.ts     # Entrevista con IA
│   ├── [locale]/                 # i18n (en, es)
│   │   ├── generator/page.tsx     # Página principal
│   │   ├── layout.tsx           # Layout compartido
│   │   └── page.tsx             # Landing
│   ├── globals.css               # Estilos globales
│   └── page.tsx                 # Redirect a /es
│
├── components/                   # Componentes React
│   ├── ConversationalForm.tsx    # Formulario inicial
│   ├── InterviewChat.tsx         # Chat de entrevista
│   ├── SpeechResult.tsx          # Resultados + export DOCX
│   ├── Header.tsx                # Navegación
│   └── Footer.tsx                # Footer
│
├── lib/                         # Lógica de negocio
│   ├── ai.ts                    # Cliente Google AI
│   ├── prompts.ts                # Builders de prompts
│   ├── interview-prompts.ts      # Prompts de entrevista
│   └── examples.ts              # Ejemplos por tono
│
├── i18n/                        # Configuración i18n
│   ├── request.ts                # Carga de traducciones
│   └── routing.ts               # Rutas de idioma
│
├── messages/                     # Traducciones
│   ├── en.json                  # Inglés
│   └── es.json                  # Español
│
├── spec/                        # Documentación
│   ├── SDD.md                   # Software Design Document
│   └── SECURITY_REPORT.md        # Reporte de seguridad
│
└── package.json                 # Dependencias
```

---

## Principios de Desarrollo

### 1. Next.js App Router Best Practices

```typescript
// ✅ Server Components por defecto
// app/page.tsx (sin 'use client')

// ✅ Client Components solo cuando necesito interactividad
'use client';
// components/InterviewChat.tsx
```

| Tipo | Use Case | 'use client' |
|------|-----------|---------------|
| Server | Data fetching, layouts, static | No |
| Client | useState, useEffect, event handlers | Sí |

---

### 2. TypeScript Estricto

```typescript
// ✅ Usar interfaces para props
interface SpeechResultProps {
    speech: string;
    onRegenerate: () => void;
    onNewSpeech: () => void;
    isLoading: boolean;
    speakerName?: string;
    coupleNames?: string;
}

// ✅ Tipos explícitos para funciones
function buildPrompt(input: SpeechInput): string {
    // ...
}

// ✅ Enums para valores fijos
type Tone = 'heartfelt' | 'funny' | 'formal' | 'mix' | 'witty' | 'straightforward' | 'celebratory';
type Duration = 'short' | 'medium' | 'long';
```

---

### 3. Seguridad Prioritaria

```typescript
// ✅ Validación de entrada con Zod
import { z } from 'zod';

const speechInputSchema = z.object({
    relationship: z.enum(['bestMan', 'maidOfHonor', 'father', 'mother', 'sibling', 'friend', 'other']),
    coupleNames: z.string().min(1).max(200),
    tone: z.enum(['heartfelt', 'funny', 'formal', 'mix', 'witty', 'straightforward', 'celebratory']),
    // ...
});

// ✅ Error handling sin exponer detalles
catch (error) {
    console.error('Error:', error); // Solo en logs
    return NextResponse.json(
        { error: 'An error occurred' }, // Mensaje genérico
        { status: 500 }
    );
}

// ✅ API key siempre de environment
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('Service unavailable'); // No revelar nombre de variable
}
```

---

### 4. Streaming de Respuestas

```typescript
// ✅ Implementación correcta de streaming
const encoder = new TextEncoder();
const stream = new ReadableStream({
    async start(controller) {
        try {
            for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) {
                    controller.enqueue(encoder.encode(text));
                }
            }
            controller.close();
        } catch (error) {
            controller.error(error);
        }
    },
});
```

---

### 5. Internacionalización

```typescript
// ✅ Usar next-intl en componentes
import { useTranslations } from 'next-intl';

export default function MyComponent() {
    const t = useTranslations('generator');
    return <h1>{t('title')}</h1>;
}

// ✅ Estructura de traducciones
// messages/es.json
{
  "generator": {
    "title": "Crea tu Discurso de Boda",
    "relationshipLabel": "Tu relación con la pareja",
    "coupleNamesLabel": "Nombres de la pareja"
    // ...
  }
}
```

---

### 6. Estilos con Tailwind

```css
/* ✅ Usar clases utilitarias */
<div className="container mx-auto px-4">

/* ✅ Estilos específicos en globals.css */
.result-container {
    /* branding Verbo: minimalista, elegante */
}

/* Colores de marca */
@theme {
    --color-verbo-gold: #b8860b;
    --color-verbo-dark: #1a1a1a;
    --color-verbo-grey: #888888;
}
```

---

## Patrones de Código

### 1. Componente con Estado Local

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface FormData {
    relationship: string;
    coupleNames: string;
    // ...
}

export default function ConversationalForm({ onGenerate }: Props) {
    const t = useTranslations('generator');
    const [form, setForm] = useState<FormData>({
        relationship: '',
        coupleNames: '',
        // ...
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(form);
    };

    return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

---

### 2. API Route con Streaming

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validar
        if (!body.coupleNames) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Generar con streaming
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContentStream(prompt);

        // Crear stream de respuesta
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of result.stream) {
                    controller.enqueue(encoder.encode(chunk.text()));
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Service unavailable' },
            { status: 500 }
        );
    }
}
```

---

### 3. Cliente de AI Reutilizable

```typescript
// lib/ai.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = 'gemini-2.5-flash';
const SYSTEM_INSTRUCTION = `...`;

function getClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Service unavailable');
    }
    return new GoogleGenerativeAI(apiKey);
}

export async function generateSpeech(prompt: string): Promise<ReadableStream> {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
            temperature: 0.75,
            topP: 0.92,
        },
    });

    const result = await model.generateContentStream(prompt);

    // Streaming implementation...
}
```

---

## Checklist de Desarrollo

### Antes de Commit

- [ ] Código formateado con Prettier
- [ ] Sin errores de ESLint
- [ ] Sin `console.log` en producción
- [ ] Traducciones agregadas a `messages/en.json` y `messages/es.json`
- [ ] TypeScript sin errores
- [ ] Tests pasando (si aplica)

### Antes de Deploy

- [ ] API key configurada en environment del hosting
- [ ] `.env.local` NO en git (verificar .gitignore)
- [ ] Dependencias actualizadas (`npm audit fix`)
- [ ] Build exitoso (`npm run build`)
- [ ] Security headers configurados en `next.config.ts`

---

## Comandos de Desarrollo

```bash
# Desarrollo
npm run dev                # Inicia servidor en modo desarrollo (hot reload)
                           # Default: http://localhost:3000

# Build
npm run build              # Compila la aplicación para producción

# Producción
npm run start              # Inicia servidor en modo producción
                           # Requiere haber ejecutado npm run build primero

# Linting
npm run lint               # Ejecuta ESLint para verificar código

# Audit de seguridad
npm audit                  # Verifica vulnerabilidades en dependencias
npm audit fix              # Intenta corregir vulnerabilidades automáticamente
```

### Comando Principal de Ejecución

| Entorno | Comando | Descripción |
|----------|---------|-------------|
| **Desarrollo** | `npm run dev` | Servidor con hot reload en puerto 3000 |
| **Producción** | `npm run build && npm start` | Build optimizado + servidor de producción |

### Nota Importante

Para **desarrollo local**, simplemente ejecuta:
```bash
npm run dev
```

---

## Flujo de Trabajo

### 1. Nueva Feature

1. Crear rama: `git checkout -b feature/nombre`
2. Implementar siguiendo principios del proyecto
3. Agregar traducciones ES y EN
4. Validar seguridad y tipos
5. Commit con mensaje claro
6. Crear PR con descripción

### 2. Bug Fix

1. Crear rama: `git checkout -b fix/bug-descripcion`
2. Reproducir y entender el problema
3. Implementar fix con tests (si aplica)
4. Verificar que no rompe nada
5. Commit y PR

---

## Seguridad - CRÍTICO

### Variables de Entorno

```bash
# .env.local (NUNCA commitear)
GEMINI_API_KEY=tu_api_key_aqui
```

### Headers de Seguridad (next.config.ts)

```typescript
async headers() {
    return [
        {
            source: '/(.*)',
            headers: [
                { key: 'X-Frame-Options', value: 'DENY' },
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'X-XSS-Protection', value: '1; mode=block' },
                // ...
            ]
        }
    ];
}
```

---

## Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Google AI Docs](https://ai.google.dev/gemini-api/docs)
- [next-intl Docs](https://next-intl-docs.vercel.app/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Documentación del Proyecto

- **SDD:** `spec/SDD.md` - Diseño técnico completo
- **Security:** `spec/SECURITY_REPORT.md` - Reporte de seguridad
- **Roles:** `agent/` - Roles de agentes

---

**Versión:** 1.0
**Actualizado:** 12 de Marzo, 2026
