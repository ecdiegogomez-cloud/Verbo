# Reporte de Seguridad - Wedding Speech Savior (Verbo)

**Fecha:** 12 de Marzo, 2026
**Versión del Proyecto:** 0.1.0
**Estado:** ⚠️ **REQUIERE ATENCIÓN INMEDIATA**

---

## Resumen Ejecutivo

| Severidad | Cantidad |
|-----------|----------|
| 🚨 CRÍTICA | 1 |
| 🔴 ALTA | 3 |
| 🟡 MEDIA | 5 |
| 🟢 BAJA | 3 |

**Prioridad 1 (Inmediata):**
1. 🔴 **API Key de Google Gemini expuesta** en archivo `.env.local`
2. 🔴 **Revocar inmediatamente** la API key actual

---

## Vulnerabilidades CRÍTICAS

### 🔴 VULNERABILIDAD #1: API Key Hardcoded

**Severidad:** CRÍTICA
**CWE:** CWE-798 (Use of Hard-coded Credentials)

**Ubicación:** `.env.local`

**Riesgo:**
- La API key está visible en el archivo `.env.local`
- Si se sube accidentalmente a Git, la key queda expuesta públicamente
- Permite uso no autorizado de la API de Google Gemini
- Puede generar costos inesperados en tu cuenta

**Acciones Inmediatas:**
```bash
# 1. Ir a Google AI Studio y REVOCAR la API key actual
# 2. Generar una nueva API key
# 3. Reemplazar en .env.local
# 4. Asegurar que .env.local está en .gitignore
```

**En producción:**
- Usar secrets del hosting (Vercel, Netlify, Railway)
- Nunca commitear `.env.local`
- Rotar API keys periódicamente

---

## Vulnerabilidades ALTAS

### 🔴 VULNERABILIDAD #2: Falta de Rate Limiting

**Severidad:** ALTA
**CWE:** CWE-770 (Allocation of Resources Without Limits)

**Ubicación:**
- `app/api/generate/route.ts`
- `app/api/interview/route.ts`

**Riesgo:**
- Un atacante puede enviar muchas solicitudes
- Puede agotar la cuota de API de Google Gemini
- Puede causar facturación elevada inesperada
- Posible ataque DoS

**Solución:**
Crear middleware de rate limiting:

```typescript
// lib/rateLimiter.ts
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, limit = 10): boolean {
    const now = Date.now();
    const record = requestCounts.get(identifier);

    if (!record || now > record.resetTime) {
        requestCounts.set(identifier, { count: 1, resetTime: now + 60000 });
        return true;
    }

    if (record.count >= limit) {
        return false;
    }

    record.count++;
    return true;
}

// Usar en route.ts
export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    if (!checkRateLimit(ip, 10)) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 }
        );
    }
    // ... resto del código
}
```

---

### 🔴 VULNERABILIDAD #3: Falta de Headers de Seguridad HTTP

**Severidad:** ALTA
**CWE:** CWE-693 (Protection Mechanism Failure)

**Ubicación:** `next.config.ts`

**Riesgo:**
- Sin protección contra clickjacking
- Sin Content Security Policy (CSP)
- Sin HSTS para HTTPS
- Vulnerable a XSS si hay inyección

**Solución:**

```typescript
// next.config.ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()'
                    },
                    ...(process.env.NODE_ENV === 'production' ? [{
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains'
                    }] : [])
                ]
            }
        ];
    }
};

export default withNextIntl(nextConfig);
```

---

### 🔴 VULNERABILIDAD #4: Dependencias Sin Auditoría

**Severidad:** ALTA
**CWE:** CWE-1104 (Use of Unmaintained Third Party Components)

**Riesgo:**
- Dependencias pueden tener vulnerabilidades conocidas
- Exposición a CVEs
- Ataques en la cadena de suministro

**Acciones:**
```bash
# Verificar vulnerabilidades
npm audit --audit-level=moderate

# Corregir automáticamente
npm audit fix

# Verificar dependencias desactualizadas
npm outdated
```

---

## Vulnerabilidades MEDIAS

### 🟡 VULNERABILIDAD #5: Validación de Entrada Insuficiente

**Severidad:** MEDIA
**CWE:** CWE-20 (Improper Input Validation)

**Ubicación:**
- `app/api/generate/route.ts`
- `app/api/interview/route.ts`

**Riesgo:**
- Solo se verifica presencia de campos
- No hay validación de tipos
- No hay limitación de longitud
- Payloads malformados pueden causar problemas

**Solución con Zod:**

```typescript
// lib/validation.ts
import { z } from 'zod';

export const speechInputSchema = z.object({
    relationship: z.enum(['bestMan', 'maidOfHonor', 'father', 'mother', 'sibling', 'friend', 'other']),
    relationshipTarget: z.string().max(100).optional(),
    coupleNames: z.string().min(1).max(200),
    speakerName: z.string().max(100).optional(),
    tone: z.enum(['heartfelt', 'funny', 'formal', 'mix', 'witty', 'straightforward', 'celebratory']),
    duration: z.enum(['short', 'medium', 'long']),
    speechLang: z.enum(['en', 'es']),
    anecdotes: z.string().max(10000).optional(),
});

// Usar en route.ts
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedBody = speechInputSchema.parse(body);
        // ... usar validatedBody
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            );
        }
        throw error;
    }
}
```

---

### 🟡 VULNERABILIDAD #6: Inyección de Prompt

**Severidad:** MEDIA
**CWE:** CWE-94 (Code Injection) - Prompt Injection

**Riesgo:**
- Un usuario malintencionado podría inyectar instrucciones
- Podría hacer que la IA genere contenido indeseado
- Podría revelar información del system prompt

**Solución:**

```typescript
// lib/sanitizer.ts
export function sanitizeUserInput(input: string): string {
    return input
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\[SYSTEM/gi, '[ SYSTEM')
        .replace(/\[\/SYSTEM\]/gi, '[/SYSTEM]')
        .substring(0, 5000); // Limitar longitud
}
```

---

### 🟡 VULNERABILIDAD #7: Exposición de Errores al Cliente

**Severidad:** MEDIA
**CWE:** CWE-209 (Information Exposure Through Error Messages)

**Riesgo:**
- Los mensajes de error exponen detalles del sistema
- Ayudan a atacantes a entender la arquitectura
- Pueden revelar información sensible

**Solución:**

```typescript
// En lugar de:
catch (error) {
    return NextResponse.json(
        { error: error.message },
        { status: 500 }
    );
}

// Usar:
catch (error) {
    console.error('Error:', error); // Log detallado solo en servidor
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }

    return NextResponse.json({
        error: 'An error occurred. Please try again.'
    }, { status: 500 });
}
```

---

### 🟡 VULNERABILIDAD #8: Falta de Logging de Actividad Sospechosa

**Severidad:** MEDIA
**Riesgo:**
- Sin registro de ataques
- Difícil detectar patrones maliciosos
- Sin trazabilidad de incidentes

**Recomendación:**
Implementar logging con herramientas como Sentry o LogRocket para capturar:
- Intentos de rate limit excedidos
- Errores de validación de entrada
- Errores de API
- Patrones de uso anómalos

---

### 🟡 VULNERABILIDAD #9: Falta de Validación de Longitud de Mensajes

**Severidad:** MEDIA

**Riesgo:**
- Mensajes muy largos pueden causar problemas de memoria
- Pueden ser utilizados en ataques DoS

**Solución:**

```typescript
const MAX_MESSAGE_LENGTH = 2000;

const handleSend = async () => {
    const trimmed = inputValue.trim();

    if (trimmed.length > MAX_MESSAGE_LENGTH) {
        setError('Message too long. Maximum 2000 characters.');
        return;
    }
    // ...
};
```

---

## Vulnerabilidades BAJAS

### 🟢 VULNERABILIDAD #10: Potencial XSS

**Severidad:** BAJA
**Estado:** No se detectó uso directo, pero sin medidas defensivas

**Recomendación:**
Agregar validación de contenido aunque React escapa por defecto:

```typescript
function isValidTextContent(text: string): boolean {
    return !/<[^>]>/.test(text) && text.length < 50000;
}
```

---

## Checklist de Corrección

### Prioridad CRÍTICA (Antes de producción)

- [ ] **REVOCAR** la API key de Google Gemini actual
- [ ] Generar nueva API key
- [ ] Verificar que `.env.local` está en `.gitignore`
- [ ] Configurar secrets en el hosting (Vercel/Netlify)
- [ ] Documentar proceso de rotación de API keys

### Prioridad ALTA (1-2 semanas)

- [ ] Implementar rate limiting en endpoints API
- [ ] Agregar headers de seguridad HTTP en `next.config.ts`
- [ ] Configurar Content Security Policy
- [ ] Ejecutar `npm audit` y corregir vulnerabilidades
- [ ] Implementar validación de entrada con Zod

### Prioridad MEDIA (1 mes)

- [ ] Sanitizar entrada de usuario (prompt injection)
- [ ] Mejorar manejo de errores (no exponer detalles)
- [ ] Implementar logging de actividad sospechosa
- [ ] Agregar validación de longitud de cadenas
- [ ] Implementar protección CSRF

### Prioridad BAJA (Mejoras adicionales)

- [ ] Agregar validación XSS defensiva
- [ ] Implementar monitoreo de errores en producción (Sentry)
- [ ] Configurar alertas de seguridad
- [ ] Documentar políticas de seguridad
- [ ] Realizar pruebas de penetración periódicas

---

## Recursos de Seguridad

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/security)
- [Google AI Security](https://ai.google.dev/docs/security)

---

**Importante:** Revisa el archivo `.env.local` y revoca la API key inmediatamente si no lo has hecho ya.
