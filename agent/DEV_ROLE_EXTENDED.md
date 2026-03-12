# Rol del Agente de Desarrollo Avanzado - Wedding Speech Savior (Verbo)

> Este rol complementa al rol base, cubriendo Testing, Deployment y Debugging.

---

## Testing Patterns

### 1. Estrategia de Testing

```
        /\
       /E2E\      ← Pruebas de usuario completo (Playwright)
      /------\
     /Integration\  ← Pruebas de componentes con API
    /----------\
   /  Unit Tests \ ← Pruebas de funciones puras
  /______________\
```

---

### 2. Unit Tests (Jest + React Testing Library)

```typescript
// tests/lib/prompts.test.ts
import { buildPrompt } from '@/lib/prompts';

describe('buildPrompt', () => {
    it('debe construir prompt en español', () => {
        const input = {
            relationship: 'bestMan',
            coupleNames: 'Ana y Juan',
            tone: 'heartfelt',
            duration: 'medium',
            speechLang: 'es',
            anecdotes: 'Una vez...',
        };

        const prompt = buildPrompt(input);

        expect(prompt).toContain('Ana y Juan');
        expect(prompt).toContain('Escribe un discurso de boda');
        expect(prompt).toContain('palabras');
    });

    it('debe lanzar error con datos inválidos', () => {
        const input = {
            relationship: '', // inválido
            coupleNames: '',
            tone: 'heartfelt',
            duration: 'medium',
            speechLang: 'es',
            anecdotes: '',
        };

        expect(() => buildPrompt(input)).toThrow();
    });
});
```

---

### 3. Component Tests

```typescript
// tests/components/SpeechResult.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import SpeechResult from '@/components/SpeechResult';

describe('SpeechResult', () => {
    const defaultProps = {
        speech: 'Este es un discurso de prueba.',
        onRegenerate: jest.fn(),
        onNewSpeech: jest.fn(),
        isLoading: false,
    };

    it('muestra el discurso completo', () => {
        render(<SpeechResult {...defaultProps} />);

        expect(screen.getByText('Este es un discurso de prueba.')).toBeInTheDocument();
    });

    it('llama a onRegenerate al hacer clic en regenerar', () => {
        render(<SpeechResult {...defaultProps} />);

        const regenerateBtn = screen.getByText('Regenerate');
        fireEvent.click(regenerateBtn);

        expect(defaultProps.onRegenerate).toHaveBeenCalledTimes(1);
    });

    it('deshabilita botón de regenerar cuando está cargando', () => {
        render(<SpeechResult {...defaultProps} isLoading={true} />);

        const regenerateBtn = screen.getByText('Regenerate');
        expect(regenerateBtn).toBeDisabled();
    });
});
```

---

### 4. API Tests

```typescript
// tests/api/generate.test.ts
import { POST } from '@/app/api/generate/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/ai', () => ({
    generateSpeech: jest.fn(),
}));

describe('POST /api/generate', () => {
    it('debe validar campos requeridos', async () => {
        const request = new NextRequest('http://localhost:3000/api/generate', {
            method: 'POST',
            body: JSON.stringify({ coupleNames: '' }), // faltan campos
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Missing required fields');
    });

    it('debe devolver stream de respuesta', async () => {
        const mockStream = new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode('Test'));
                controller.close();
            },
        });

        const { generateSpeech } = require('@/lib/ai');
        generateSpeech.mockResolvedValue(mockStream);

        const request = new NextRequest('http://localhost:3000/api/generate', {
            method: 'POST',
            body: JSON.stringify({
                relationship: 'bestMan',
                coupleNames: 'Ana y Juan',
                tone: 'heartfelt',
                duration: 'medium',
                speechLang: 'es',
                anecdotes: 'Test anecdota',
            }),
        });

        const response = await POST(request);

        expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
        expect(response.headers.get('Transfer-Encoding')).toBe('chunked');
    });
});
```

---

### 5. E2E Tests (Playwright)

```typescript
// tests/e2e/speech-generation.spec.ts
import { test, expect } from '@playwright/test';

test('flujo completo de generación de discurso', async ({ page }) => {
    await page.goto('http://localhost:3000/es/generator');

    // Llenar formulario
    await page.selectOption('select[name="relationship"]', 'bestMan');
    await page.fill('input[name="coupleNames"]', 'Ana y Juan');
    await page.fill('input[name="speakerName"]', 'Carlos');
    await page.click('input[value="heartfelt"]');
    await page.click('input[value="medium"]');
    await page.click('button[type="submit"]');

    // Entrevista
    await expect(page.getByText('Cuéntame')).toBeVisible();
    await page.fill('textarea', 'Conocimos en la universidad...');
    await page.click('button:has-text("→")');

    // Generación
    await expect(page.getByText(/discurso/i)).toBeVisible({ timeout: 10000 });

    // Verificar resultado
    await expect(page.getByText('Descargar')).toBeVisible();
    await expect(page.getByText('Copiar')).toBeVisible();
});
```

---

### 6. Setup de Testing

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';

// Mock de API
global.fetch = jest.fn();
```

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  },
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/tests/setup.ts"],
    "testMatch": ["**/*.test.ts", "**/*.test.tsx"],
    "collectCoverageFrom": ["app/**", "components/**", "lib/**"],
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    }
  }
}
```

---

### 7. Testing Anti-Patterns

| ❌ No Hacer | ✅ Hacer En Su Lugar |
|--------------|---------------------|
| Testar implementación interna | Testar comportamiento visible |
| Usar `querySelector` | Usar `getByRole`, `getByText` |
| Mockear funciones simples | Usar funciones reales |
| Testar en aislamiento total | Testar integración real |
| Tests frágiles (tiempos exactos) | Tests robustos con espera |
| Tests que pasan sin cambios | Verificar que fail sin feature |

---

## Deployment Workflows

### 1. Plataformas de Deploy

| Plataforma | Comandos | Secrets | Preview |
|-----------|-----------|---------|---------|
| **Vercel** | `vercel deploy` | Vercel Dashboard | ✅ Sí |
| **Netlify** | `netlify deploy` | Netlify Environment | ✅ Sí |
| **Railway** | `railway up` | Railway Variables | ✅ Sí |
| **AWS Amplify** | `amplify deploy` | Amplify Console | ❌ No |

---

### 2. Deploy en Vercel (Recomendado)

```bash
# Instalar CLI
npm i -g vercel

# Login (una vez)
vercel login

# Deploy por primera vez
vercel

# Deploy de producción
vercel --prod

# Ver logs en tiempo real
vercel logs

# Ver proyectos
vercel ls
```

---

### 3. Configuración de Environment Variables

```bash
# Vercel CLI
vercel env add GEMINI_API_KEY production

# Vercel Dashboard (UI)
Settings → Environment Variables → Add Variable
```

**Variables requeridas:**
- `GEMINI_API_KEY` - Google Generative AI API Key
- `NODE_ENV` - `production` (automático en Vercel)

---

### 4. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm audit --audit-level=moderate

  deploy:
    needs: [test, security-audit]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

### 5. Pre-Deploy Checklist

```bash
#!/bin/bash
# scripts/pre-deploy.sh

echo "🔍 Pre-Deploy Checklist"

# 1. Lint
echo "1️⃣ Ejecutando lint..."
npm run lint || exit 1

# 2. Tests
echo "2️⃣ Ejecutando tests..."
npm test || exit 1

# 3. Build
echo "3️⃣ Verificando build..."
npm run build || exit 1

# 4. Security audit
echo "4️⃣ Verificando vulnerabilidades..."
npm audit --audit-level=moderate || {
    echo "⚠️ Hay vulnerabilidades de moderado o crítico"
    exit 1
}

# 5. Type check
echo "5️⃣ Verificando tipos..."
npx tsc --noEmit || exit 1

# 6. Check .env.local
echo "6️⃣ Verificando .env.local..."
if git ls-files | grep -q ".env.local"; then
    echo "❌ ERROR: .env.local está en git"
    exit 1
fi

echo "✅ Todos los checks pasaron"
```

---

### 6. Deploy Commands

```bash
# Desarrollo local
npm run dev

# Preview deploy (Vercel)
vercel

# Production deploy (Vercel)
vercel --prod

# Verificar deploy
vercel ls
curl https://verbo.vercel.app

# Rollback (Vercel)
vercel rollback

# Rollback a versión específica
vercel rollback <deployment-url>
```

---

### 7. Monitoring Post-Deploy

| Servicio | Propósito | Setup |
|----------|-----------|-------|
| **Vercel Analytics** | Analytics básicos | Automático en Vercel |
| **Sentry** | Error tracking | `npm install @sentry/nextjs` |
| **LogRocket** | Session replay | Dashboard → Add project |
| **Google Search Console** | SEO | Verificar dominio |

---

## Debugging Strategies

### 1. Debugging con Next.js

```typescript
// Server-side debugging (use console.log en development)
export async function GET() {
    console.log('🔵 [API] Request received');
    const data = await fetchData();
    console.log('🟢 [API] Data fetched:', data);
    return Response.json(data);
}
```

```typescript
// Client-side debugging
'use client';
import { useEffect } from 'react';

export default function MyComponent() {
    useEffect(() => {
        console.log('🟡 [Client] Component mounted');
        return () => console.log('🔴 [Client] Component unmounted');
    }, []);

    return <div>...</div>;
}
```

---

### 2. Debugging de Streaming

```typescript
// Debug del stream de respuesta
const encoder = new TextEncoder();
const stream = new ReadableStream({
    async start(controller) {
        try {
            let chunkCount = 0;
            for await (const chunk of result.stream) {
                chunkCount++;
                const text = chunk.text();
                console.log(`[Stream] Chunk ${chunkCount}:`, text);
                if (text) {
                    controller.enqueue(encoder.encode(text));
                }
            }
            console.log(`[Stream] Complete. Total chunks: ${chunkCount}`);
            controller.close();
        } catch (error) {
            console.error('[Stream] Error:', error);
            controller.error(error);
        }
    },
});
```

---

### 3. Debugging de State de React

```typescript
// useDebugValue para inspección
'use client';
import { useState, useDebugValue } from 'react';

export function useForm(initialValue: string) {
    const [value, setValue] = useState(initialValue);

    useDebugValue(`Form value: "${value}"`);

    return [value, setValue] as const;
}

// Ver en React DevTools → ⚛️ Components
```

---

### 4. Debugging de Prompts de IA

```typescript
// Log del prompt completo para debugging
const prompt = buildPrompt(input);

// Solo en development
if (process.env.NODE_ENV === 'development') {
    console.log('=== GENERATION PROMPT ===');
    console.log(prompt);
    console.log('=== END PROMPT ===');
}

// Guardar en archivo para análisis
if (process.env.SAVE_PROMPTS === 'true') {
    const fs = require('fs');
    fs.writeFileSync(`prompts/${Date.now()}.txt`, prompt);
}
```

---

### 5. Error Boundaries

```typescript
// app/error.tsx
'use client';

export default function Error({
    error,
    reset,
}: {
    error: Error;
    reset: () => void;
}) {
    console.error('[Error Boundary]', error);

    return (
        <div className="error-boundary">
            <h2>Algo salió mal</h2>
            <p>Por favor, intenta de nuevo.</p>
            <button onClick={reset}>Reintentar</button>
            <details>
                <summary>Detalles técnicos</summary>
                <pre>{error.message}</pre>
                <pre>{error.stack}</pre>
            </details>
        </div>
    );
}
```

---

### 6. Debugging de API Calls

```typescript
// Middleware de logging de requests
// lib/api-logger.ts
export function logApiRequest(path: string, body: any) {
    console.log(`[API] ${path} →`, {
        body: sanitizeForLog(body),
        timestamp: new Date().toISOString(),
    });
}

export function logApiResponse(path: string, status: number, duration: number) {
    console.log(`[API] ${path} ←`, {
        status,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
    });
}

function sanitizeForLog(data: any): any {
    // Remover datos sensibles
    if (data.apiKey) return '[REDACTED]';
    if (data.password) return '[REDACTED]';
    return data;
}
```

---

### 7. DevTools de Next.js

```typescript
// next.config.ts - Habilitar source maps en desarrollo
const nextConfig: NextConfig = {
    productionBrowserSourceMaps: false, // Mantener false en producción
    // Para debugging de source maps en dev:
    // webpack: (config) => ({ ...config, devtool: 'source-map' })
};
```

**DevTools a usar:**
- **React DevTools** - Inspeccionar componentes y state
- **Next.js DevTools** - Cache, revalidations
- **Chrome DevTools** - Network, Console, Performance
- **Vercel Dashboard** - Logs y deployments

---

### 8. Debugging Checklist

| Síntoma | Posible Causa | Debug Steps |
|-----------|----------------|-------------|
| Stream no actualiza | Error en lectura del reader | Agregar logs en el loop for await |
| Estado no actualiza | Cierre incorrecto del stream | Verificar controller.close() |
| API key no funciona | Variable no cargada | Verificar process.env en runtime |
| Traducciones faltan | Clave incorrecta en useTranslations | Verificar messages/{lang}.json |
| Build falla | Error de TypeScript | Ejecutar `npx tsc --noEmit` |

---

### 9. Common Bugs y Fixes

```typescript
// Bug 1: Hook en condición ❌
if (condition) {
    const [value, setValue] = useState(initial);
}
// Fix ✅
const [value, setValue] = useState(initial);
if (condition) {
    // usar value, setValue
}

// Bug 2: Efecto sin dependencias correctas ❌
useEffect(() => {
    fetchData();
}); // se ejecuta cada render
// Fix ✅
useEffect(() => {
    fetchData();
}, []); // solo al montar

// Bug 3: Array como key ❌
{items.map((item, index) => (
    <div key={index}>{item.name}</div>
))}
// Fix ✅
{items.map((item) => (
    <div key={item.id}>{item.name}</div>
))}

// Bug 4: Estado mutado directamente ❌
const [items, setItems] = useState([]);
items.push(newItem); // NO dispersa re-render
// Fix ✅
setItems([...items, newItem]);
```

---

## Integración con Rol Base

Este rol de desarrollo avanzado complementa al rol base (`DEV_ROLE.md`).

**Para usar ambos roles:**
1. Leer primero `DEV_ROLE.md` para entender stack y principios
2. Usar este rol para testing, deployment y debugging
3. Ambos archivos están conectados por el proyecto Wedding Speech Savior

---

## Comandos de Testing y Deploy

```bash
# Tests
npm test                          # Unit tests
npm run test:watch              # Modo watch
npm run test:coverage            # Con reporte de coverage
npm run test:e2e                # E2E con Playwright

# Deployment
vercel                            # Preview deploy
vercel --prod                     # Production deploy
vercel logs                        # Ver logs

# Debugging
npm run dev                        # Desarrollo con debug
NODE_ENV=development npm run dev # Debug explícito
```

---

## Recursos

- [Jest Docs](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright Docs](https://playwright.dev/docs/intro)
- [Vercel Docs](https://vercel.com/docs)
- [Sentry Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Next.js Debugging](https://nextjs.org/docs/archives/next-15.0.5/app/building-your-application/debugging)

---

## Documentación del Proyecto

- **SDD:** `spec/SDD.md` - Diseño técnico completo
- **Security:** `spec/SECURITY_REPORT.md` - Reporte de seguridad
- **Rol Base:** `agent/DEV_ROLE.md` - Fundamentos del stack
- **Roles IA:** `agent/ROLE.md` - Rol del generador de discursos

---

**Versión:** 1.0
**Actualizado:** 12 de Marzo, 2026
**Conectado a:** DEV_ROLE.md (rol base)
