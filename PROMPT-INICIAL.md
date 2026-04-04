# Prompt Inicial para Claude Code

> Copia y pega este prompt en una nueva conversación de Claude Code para iniciar el desarrollo del Sprint 0.

---

```
Actúa como desarrollador senior de Next.js. Vamos a construir un template web reutilizable para profesionistas en LATAM. El documento completo de requerimientos está en @REQUERIMIENTOS-v1.1.md — léelo completo antes de hacer cualquier cosa.

Vamos a empezar con el Sprint 0: Setup y Fundamentos. Necesito que hagas lo siguiente EN ORDEN, esperando mi confirmación entre cada paso:

## Paso 1: Crear proyecto Next.js
- Crear proyecto Next.js 14+ con App Router y TypeScript
- Configurar Tailwind CSS
- Configurar ESLint con reglas estrictas de TypeScript
- Configurar path aliases (@/ → src/)

## Paso 2: Instalar dependencias
- @supabase/supabase-js @supabase/ssr
- zod react-hook-form @hookform/resolvers
- date-fns date-fns-tz
- resend @react-email/components
- mercadopago
- @upstash/ratelimit @upstash/redis

## Paso 3: Inicializar shadcn/ui
- Ejecutar el init de shadcn/ui
- Agregar componentes base: button, input, card, badge, dialog, label, separator, skeleton, toast

## Paso 4: Crear estructura de carpetas
- Crear TODA la estructura de carpetas definida en §3.1 del documento de requerimientos (archivos vacíos o con exports placeholder donde corresponda)
- Crear el archivo client.config.ts exactamente como está en §3.2

## Paso 5: Configurar Supabase clients
- Crear lib/supabase/client.ts (cliente browser)
- Crear lib/supabase/server.ts (cliente servidor)
- Crear lib/supabase/middleware.ts (cliente middleware)
- Seguir la guía oficial de @supabase/ssr para Next.js App Router

## Paso 6: Crear layout base
- Layout global con metadata SEO básica
- Componente Navbar responsivo (mobile hamburger menu)
- Componente Footer básico
- Los layouts deben leer datos de client.config.ts (nombre, colores)

## Paso 7: Crear .env.example y .gitignore
- .env.example con todas las variables listadas en §6.1 (sin valores reales)
- Verificar que .gitignore incluye .env.local y .env

## Paso 8: Inicializar git
- git init, crear commit inicial
- Crear rama develop

REGLAS IMPORTANTES:
- TypeScript estricto, CERO uso de `any`
- Todos los archivos .tsx o .ts, NINGÚN .js
- No hardcodear valores de cliente — todo sale de client.config.ts
- Seguir el Repository Pattern definido en §3.3
- No instales dependencias que no estén en el documento de requerimientos
- Si tienes dudas sobre alguna decisión, pregúntame antes de implementar

Empieza con el Paso 1. Muéstrame qué comando vas a ejecutar antes de hacerlo.
```
