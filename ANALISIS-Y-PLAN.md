# Análisis de Requerimientos, Plan de Sprints y Riesgos
## Template Web para Profesionistas LATAM

**Fecha:** 2026-04-03
**Autor del análisis:** Claude (Arquitecto SR)
**Documento analizado:** REQUERIMIENTOS.md v1.0

---

## 1. Requerimientos Faltantes o Problemáticos

### 1.1 Faltantes Críticos (bloqueantes para producción)

| # | Requerimiento faltante | Impacto | Recomendación |
|---|---|---|---|
| F-01 | **Rate limiting en API Routes y auth** | El doc lo menciona en el checklist (§6.5) pero no define implementación. Sin esto, ataques de fuerza bruta al login o spam de webhooks son triviales. | Implementar rate limiting con `upstash/ratelimit` (compatible serverless) en rutas `/api/*` y Server Actions de auth. Configurar: 10 intentos login/min por IP, 5 registros/min por IP. |
| F-02 | **Política de reembolsos** | El sistema maneja pagos pero no define qué pasa con el dinero cuando una cita se cancela. MercadoPago tiene API de refunds. | Agregar requerimiento PAGO-09: "Procesar reembolso automático/manual vía API de MercadoPago cuando una cita se cancela dentro del plazo permitido". Definir si es automático o requiere aprobación admin. |
| F-03 | **Manejo de timezone** | LATAM tiene múltiples zonas horarias. El doc no menciona cómo se almacenan/muestran fechas. Un profesionista en CDMX (UTC-6) con pacientes en otras zonas genera conflictos. | Almacenar todo en UTC en BD. Configurar timezone del negocio en `client.config.ts`. Mostrar siempre en la zona del profesionista. Usar `date-fns-tz` o `luxon`. |
| F-04 | **Manejo de sesiones concurrentes y expiración de slots** | Si un paciente inicia el flujo de agendar y no paga, el slot queda "reservado" indefinidamente. Otros pacientes no pueden tomarlo pero nunca se confirma. | Implementar reserva temporal (TTL ~15 min). Usar estado `reservado` en la tabla `citas` con un cron job o función de Supabase que libere slots expirados. |
| F-05 | **Página 404 y manejo de errores global** | No hay definición de páginas de error. Un usuario que navega a una ruta inexistente ve el error default de Next.js. | Crear `not-found.tsx`, `error.tsx` y `loading.tsx` globales con diseño consistente. |
| F-06 | **Terms of Service / Política de Privacidad** | Obligatorio legalmente para procesar pagos y datos de salud en México (LFPDPPP). | Agregar rutas `/terminos` y `/privacidad`. El contenido se configura por cliente en `client.config.ts` o archivos MDX separados. |

### 1.2 Problemas en Requerimientos Existentes

| # | Problema | Dónde | Corrección |
|---|---|---|---|
| P-01 | **Cal.com aparece en stack pero nunca en requerimientos funcionales** | §2 Stack y §5.2 Agendamiento | El doc dice "Cal.com (embed)" en el stack pero los requerimientos de citas definen un sistema propio con BD propia. **Decisión necesaria:** ¿se usa Cal.com o se construye el calendario? Recomiendo construirlo propio porque: (a) ya tienes el esquema de BD, (b) Cal.com agrega complejidad de integración y dependencia externa, (c) para este scope es viable. **Eliminar Cal.com del stack.** |
| P-02 | **Constraint `no_doble_booking` es insuficiente** | §4.3 Tabla citas | `UNIQUE (fecha, hora_inicio)` solo previene dos citas con EXACTAMENTE la misma hora de inicio. Una cita de 09:00-10:00 no bloquea una de 09:30-10:30. | Usar un `EXCLUDE` constraint con `tsrange` o validar solapamiento en el Server Action antes de insertar. |
| P-03 | **RLS recursivo en `profiles_admin_all`** | §4.1 Tabla profiles | La policy `profiles_admin_all` consulta la misma tabla `profiles` para verificar rol admin. Esto puede causar recursión infinita en PostgreSQL. | Solución: consultar `auth.users` metadata en lugar de `profiles`, o usar una función `SECURITY DEFINER` que verifique el rol sin pasar por RLS. |
| P-04 | **Falta estado `reservado` en tabla citas** | §4.3 | El CHECK solo permite `pendiente, confirmada, cancelada, completada`. No hay estado intermedio entre "seleccionó slot" y "pagó". | Agregar estado `reservado` con TTL. Flujo: `reservado` → pago → `confirmada`, o timeout → se elimina la reserva. |
| P-05 | **`client.config.ts` usa `process.env` directamente** | §3.2 | Mezcla configuración de negocio (estática) con secrets (env vars). Si alguien importa el config en el cliente, expone que `NEXT_PUBLIC_MP_PUBLIC_KEY` se lee ahí. | Separar: `client.config.ts` solo datos de negocio. Los secrets se leen en `lib/mercadopago/client.ts` directamente desde `process.env`. |
| P-06 | **No hay validación de horarios en backend** | §5.2 CITA-02 | Se valida contra `client.config.ts` pero un atacante puede enviar cualquier hora via la API. | Validar en el Server Action que la hora solicitada cae dentro de `horarios` del config Y no está en `diasBloqueados`. |
| P-07 | **Webhook MP: parsing de body incorrecto** | §6.3 | Se hace `req.text()` para HMAC y luego `JSON.parse(body)`, pero el `data.id` del webhook de MP v2 viene en query params, no en el body para el tipo `payment`. | Revisar la documentación actual de webhooks v2 de MercadoPago. El `data.id` viene en el JSON body como `event.data.id`. Validar contra la API real. |

### 1.3 Mejoras Recomendadas (no bloqueantes)

| # | Mejora | Justificación |
|---|---|---|
| M-01 | Agregar tabla `horarios_bloqueados` en BD en lugar de array en config | Permite al admin bloquear días desde el dashboard sin redesplegar |
| M-02 | Agregar notificaciones push/SMS como canal futuro | Muchos pacientes en LATAM no revisan email frecuentemente |
| M-03 | Agregar campo `cancelado_por` en tabla citas | Distinguir si canceló el paciente o el admin (útil para reembolsos) |
| M-04 | Paginación en listados de citas y pagos | Sin paginación, los queries se degradan con el tiempo |
| M-05 | Health check endpoint `/api/health` | Monitoreo básico del estado de la aplicación |

---

## 2. Plan de Sprints

> **Contexto:** Mario tiene perfil académico fuerte pero experiencia web limitada. Claude Code asiste en la implementación. Sprints de 1 semana, dedicación estimada ~3-4 horas/día.

### Sprint 0 — Setup y Fundamentos (Semana 1)
**Objetivo:** Proyecto funcional corriendo en localhost, BD lista

| Tarea | Descripción | Estimación |
|---|---|---|
| S0-01 | Crear proyecto Next.js 14+ con TypeScript, Tailwind, ESLint | 1h |
| S0-02 | Configurar estructura de carpetas según feature-based architecture | 1h |
| S0-03 | Instalar dependencias: Supabase client, Zod, React Hook Form, date-fns | 30min |
| S0-04 | Crear proyecto en Supabase, configurar `.env.local` y `.gitignore` | 1h |
| S0-05 | Ejecutar migrations: tablas `profiles`, `servicios`, `citas`, `pagos` con RLS | 2h |
| S0-06 | Configurar Supabase clients (browser + server) en `lib/supabase/` | 1h |
| S0-07 | Crear `client.config.ts` con datos de ejemplo | 30min |
| S0-08 | Crear componentes UI base: Button, Input, Card, Badge (usar shadcn/ui) | 2h |
| S0-09 | Crear layout base: Navbar, Footer | 2h |
| S0-10 | Inicializar git, crear ramas `main` y `develop` | 30min |
| **Total** | | **~11h** |

**Entregable:** App corriendo en localhost con layout base y BD configurada.

### Sprint 1 — Autenticación Completa (Semana 2)
**Objetivo:** Registro, login, logout, protección de rutas funcionando

| Tarea | Descripción | Estimación |
|---|---|---|
| S1-01 | Schema Zod para login y registro (`auth.schema.ts`) | 1h |
| S1-02 | Formulario de registro con React Hook Form + Zod | 3h |
| S1-03 | Server Action de registro con Supabase Auth | 2h |
| S1-04 | Formulario de login con React Hook Form + Zod | 2h |
| S1-05 | Server Action de login | 1h |
| S1-06 | Página de recuperación de contraseña | 2h |
| S1-07 | Verificación de email (configurar en Supabase dashboard) | 1h |
| S1-08 | Middleware de protección de rutas (auth + roles) | 3h |
| S1-09 | Hook `useAuth` para estado de sesión en cliente | 2h |
| S1-10 | Logout y limpieza de sesión | 1h |
| S1-11 | Probar flujo completo: registro → verificar email → login → rutas protegidas | 2h |
| **Total** | | **~20h** |

**Entregable:** Sistema de auth funcional con protección de rutas.

### Sprint 2 — Servicios y Agendamiento (Semana 3-4)
**Objetivo:** Paciente puede ver servicios, seleccionar fecha/hora, crear cita

| Tarea | Descripción | Estimación |
|---|---|---|
| S2-01 | Repository + types para servicios | 1.5h |
| S2-02 | Seed de servicios de ejemplo en BD | 30min |
| S2-03 | Página pública de servicios con precios y duración | 2h |
| S2-04 | API Route: disponibilidad (calcular slots libres por fecha) | 4h |
| S2-05 | Componente CalendarioDisponibilidad (selector de fecha) | 4h |
| S2-06 | Componente SelectorHora (slots disponibles para fecha seleccionada) | 3h |
| S2-07 | Schema Zod para crear cita | 1h |
| S2-08 | Server Action: crear cita con estado `reservado` + validación de solapamiento | 4h |
| S2-09 | Lógica de expiración de reservas (función SQL o cron Supabase) | 3h |
| S2-10 | Página `/agendar` con flujo completo: servicio → fecha → hora → confirmar | 4h |
| S2-11 | Dashboard paciente: ver citas próximas y pasadas | 3h |
| S2-12 | Probar flujo: seleccionar servicio → ver disponibilidad → agendar | 2h |
| **Total** | | **~32h** |

**Entregable:** Flujo de agendamiento completo (sin pagos aún). Citas se crean como `reservado`.

### Sprint 3 — Integración MercadoPago (Semana 5-6)
**Objetivo:** Pago funcional en sandbox, webhook procesando correctamente

| Tarea | Descripción | Estimación |
|---|---|---|
| S3-01 | Configurar cuenta de desarrollador MercadoPago y credenciales sandbox | 1h |
| S3-02 | Cliente MercadoPago en `lib/mercadopago/client.ts` | 1h |
| S3-03 | API Route: crear preferencia de pago | 3h |
| S3-04 | Página `/pago`: renderizar Brick de MercadoPago | 4h |
| S3-05 | Repository + types para pagos | 1.5h |
| S3-06 | API Route webhook: recibir notificación de MP | 3h |
| S3-07 | Validación HMAC del webhook | 2h |
| S3-08 | Lógica `procesarPago`: verificar monto, confirmar cita, actualizar pago | 4h |
| S3-09 | Página `/confirmacion` post-pago | 2h |
| S3-10 | Manejar pagos rechazados (no confirmar cita, mostrar mensaje) | 2h |
| S3-11 | Probar flujo completo con tarjetas de prueba de MP | 3h |
| S3-12 | Probar edge cases: pago duplicado, monto incorrecto, webhook repetido | 3h |
| **Total** | | **~30h** |

**Entregable:** Flujo completo: agendar → pagar (sandbox) → cita confirmada.

### Sprint 4 — Emails y Dashboard Admin (Semana 7)
**Objetivo:** Emails transaccionales funcionando, admin puede gestionar citas

| Tarea | Descripción | Estimación |
|---|---|---|
| S4-01 | Configurar Resend y cliente en `lib/resend/client.ts` | 1h |
| S4-02 | Template: email de confirmación de cita | 2h |
| S4-03 | Template: recibo de pago | 2h |
| S4-04 | Template: recordatorio 24h antes | 2h |
| S4-05 | Integrar envío de emails en flujo de pago confirmado | 2h |
| S4-06 | Cron/scheduled function para recordatorios (Supabase Edge Function o Vercel Cron) | 3h |
| S4-07 | Dashboard admin: citas del día | 3h |
| S4-08 | Dashboard admin: lista de todas las citas con filtros | 3h |
| S4-09 | Dashboard admin: CRUD de servicios | 4h |
| S4-10 | Notificación al admin por email cuando llega nueva cita | 1h |
| **Total** | | **~23h** |

**Entregable:** Emails funcionando, admin puede ver y gestionar citas y servicios.

### Sprint 5 — Landing, Pulido y Seguridad (Semana 8)
**Objetivo:** Landing page, páginas de error, checklist de seguridad completo

| Tarea | Descripción | Estimación |
|---|---|---|
| S5-01 | Landing page: hero, servicios, precios, ubicación, CTA | 4h |
| S5-02 | Páginas de error: 404, error boundary, loading states | 2h |
| S5-03 | Páginas legales: `/terminos`, `/privacidad` (placeholder) | 1h |
| S5-04 | Rate limiting con `@upstash/ratelimit` en auth y API routes | 3h |
| S5-05 | Auditoría de seguridad: RLS, env vars, middleware, validaciones | 3h |
| S5-06 | Responsive: verificar todos los flujos en mobile | 3h |
| S5-07 | Accesibilidad: labels, contraste, navegación por teclado | 2h |
| S5-08 | `npm audit`, fix vulnerabilidades | 1h |
| S5-09 | Lighthouse: optimizar hasta ≥85 en mobile | 2h |
| S5-10 | Prueba end-to-end: flujo completo registro → agendar → pagar → confirmar | 3h |
| **Total** | | **~24h** |

**Entregable:** Template completo, seguro y listo para personalización.

### Sprint 6 — Deploy y Producción (Semana 9)
**Objetivo:** App en producción con dominio real

| Tarea | Descripción | Estimación |
|---|---|---|
| S6-01 | Configurar proyecto en Vercel, conectar repositorio | 1h |
| S6-02 | Configurar variables de entorno en Vercel | 1h |
| S6-03 | Configurar dominio personalizado | 1h |
| S6-04 | Cambiar credenciales MP de TEST a producción | 1h |
| S6-05 | Configurar Resend con dominio verificado | 1h |
| S6-06 | Verificar webhook URL de producción en MP | 1h |
| S6-07 | Smoke test en producción | 2h |
| S6-08 | Documentar proceso de personalización para nuevos clientes | 2h |
| **Total** | | **~10h** |

**Entregable:** Template en producción, documentación de personalización.

### Resumen de Esfuerzo

| Sprint | Semana | Horas |
|---|---|---|
| Sprint 0 - Setup | 1 | 11h |
| Sprint 1 - Auth | 2 | 20h |
| Sprint 2 - Agendamiento | 3-4 | 32h |
| Sprint 3 - Pagos | 5-6 | 30h |
| Sprint 4 - Emails + Admin | 7 | 23h |
| Sprint 5 - Pulido + Seguridad | 8 | 24h |
| Sprint 6 - Deploy | 9 | 10h |
| **Total** | **~9 semanas** | **~150h** |

> A ~3-4 horas/día, esto son aproximadamente 9 semanas. Con Claude Code asistiendo, las tareas de código puro se aceleran significativamente, pero las tareas de integración (MercadoPago, Supabase auth, webhooks) requieren depuración que consume tiempo independientemente de la herramienta.

---

## 3. Top 5 Riesgos Técnicos

### Riesgo 1: Webhooks de MercadoPago no llegan en desarrollo local
- **Probabilidad:** Alta (100% si no se mitiga)
- **Impacto:** Bloquea completamente el Sprint 3
- **Causa:** MercadoPago necesita una URL pública para enviar webhooks. `localhost:3000` no es accesible desde internet.
- **Mitigación:** Usar **ngrok** (`ngrok http 3000`) para exponer localhost con URL pública temporal. Configurar esa URL en el dashboard de MercadoPago como webhook URL. Alternativa: usar la herramienta de prueba manual de webhooks del dashboard de MP.
- **Acción concreta:** Instalar ngrok antes del Sprint 3. Documentar el proceso en un README.

### Riesgo 2: RLS recursivo causa errores silenciosos
- **Probabilidad:** Alta
- **Impacto:** Queries fallan o retornan vacío sin error claro. Horas de debugging.
- **Causa:** La policy `profiles_admin_all` consulta `profiles` para verificar admin, creando referencia circular.
- **Mitigación:** Crear función `is_admin()` con `SECURITY DEFINER` que consulte directamente `auth.users` metadata o una tabla separada de roles. Usarla en todas las policies admin.
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND rol = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
- **Acción concreta:** Implementar esta función en el Sprint 0 antes de crear cualquier policy.

### Riesgo 3: Race condition en reserva de slots
- **Probabilidad:** Media-Alta (depende del tráfico)
- **Impacto:** Dos pacientes reservan el mismo horario. Uno paga por una cita que ya no existe.
- **Causa:** Entre que el paciente ve el slot disponible y confirma, otro paciente puede tomar el mismo slot.
- **Mitigación:** Usar transacción con `SELECT ... FOR UPDATE` en la verificación de disponibilidad + inserción. El constraint UNIQUE en BD es la última línea de defensa, pero la UX debe manejar el error gracefully.
- **Acción concreta:** En el Server Action de crear cita, usar `supabase.rpc()` llamando a una función SQL que haga la verificación + inserción en una sola transacción.

### Riesgo 4: Manejo incorrecto de cookies SSR en Supabase
- **Probabilidad:** Alta para alguien nuevo en Next.js
- **Impacto:** Sesiones que no persisten, middleware que no detecta usuario, redirects infinitos.
- **Causa:** Supabase SSR requiere configuración precisa de cookies entre middleware, Server Components y Client Components. La documentación es confusa y cambia frecuentemente.
- **Mitigación:** Seguir estrictamente la guía oficial de `@supabase/ssr` para Next.js App Router. Crear los archivos `lib/supabase/client.ts`, `lib/supabase/server.ts` y `lib/supabase/middleware.ts` exactamente como indica la documentación. No innovar aquí.
- **Acción concreta:** Usar el template oficial de Supabase para Next.js como referencia: `npx create-next-app -e with-supabase`. Extraer la configuración de auth de ahí.

### Riesgo 5: Idempotencia de webhooks
- **Probabilidad:** Media
- **Impacto:** Pago procesado dos veces, cita confirmada dos veces, emails duplicados.
- **Causa:** MercadoPago puede enviar el mismo webhook múltiples veces (retries). Sin idempotencia, cada retry ejecuta la lógica completa.
- **Mitigación:** Antes de procesar un webhook, verificar si `mp_payment_id` ya existe en la tabla `pagos` con estado `aprobado`. Si ya fue procesado, retornar 200 sin hacer nada.
- **Acción concreta:** Agregar check de idempotencia como primer paso en `procesarPago()`:
```typescript
const existente = await getPagoPorMPId(mpPaymentId);
if (existente?.estado === 'aprobado') {
  return Response.json({ already_processed: true });
}
```

---

## 4. Mejoras de Arquitectura

### 4.1 Eliminar Cal.com del stack
**Problema:** El documento lista Cal.com en el stack (§2) pero los requerimientos definen un sistema de citas completamente propio con BD, validaciones y lógica de negocio.

**Recomendación:** Eliminar Cal.com. Para este scope, un calendario propio con slots calculados desde la configuración es más simple y da control total. Cal.com agregaría: otra dependencia, otra cuenta, sincronización de estado entre dos sistemas, y complejidad de embed.

### 4.2 Usar shadcn/ui en lugar de componentes UI desde cero
**Problema:** El doc define crear componentes UI base (Button, Input, Card, Modal, Badge) manualmente.

**Recomendación:** Usar **shadcn/ui**. No es una librería (no agrega dependencia), sino componentes copiados al proyecto que se pueden personalizar. Se integra perfectamente con Tailwind y es el estándar de facto en el ecosistema Next.js. Ahorra ~10 horas de desarrollo de componentes UI.

### 4.3 Mover `diasBloqueados` del config a la BD
**Problema:** `diasBloqueados` está en `client.config.ts`. Cada vez que el profesionista quiere bloquear un día (vacaciones, enfermedad), requiere cambio de código y redeploy.

**Recomendación:** Crear tabla `horarios_bloqueados`:
```sql
CREATE TABLE horarios_bloqueados (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha      DATE NOT NULL,
  motivo     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
El admin los gestiona desde el dashboard. El endpoint de disponibilidad consulta esta tabla además del config.

### 4.4 Separar `client.config.ts` de secrets
**Problema:** El config actual mezcla datos de negocio (nombre, servicios, horarios) con env vars (`process.env.NEXT_PUBLIC_MP_PUBLIC_KEY`).

**Recomendación:** `client.config.ts` debe contener SOLO datos de negocio estáticos. Los secrets se leen directamente en los módulos que los necesitan (`lib/mercadopago/client.ts`, etc.). Esto evita importaciones accidentales de env vars en componentes de cliente.

### 4.5 Constraint de doble booking con exclusión de rangos
**Problema:** `UNIQUE (fecha, hora_inicio)` no previene solapamiento de rangos horarios.

**Recomendación:** Usar exclusion constraint con extensión `btree_gist`:
```sql
-- Habilitar extensión (una vez)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- En tabla citas, reemplazar el UNIQUE por:
ALTER TABLE citas ADD CONSTRAINT no_solapamiento
  EXCLUDE USING gist (
    fecha WITH =,
    tsrange(
      (fecha + hora_inicio)::timestamp,
      (fecha + hora_fin)::timestamp
    ) WITH &&
  ) WHERE (estado NOT IN ('cancelada'));
```
Esto previene a nivel de BD que dos citas no canceladas se solapen en el mismo día, independientemente de la duración.

---

## 5. Resumen Ejecutivo

| Categoría | Cantidad |
|---|---|
| Requerimientos faltantes críticos | 6 |
| Problemas en requerimientos existentes | 7 |
| Mejoras no bloqueantes | 5 |
| Mejoras de arquitectura | 5 |
| Riesgos técnicos identificados | 5 |
| Esfuerzo total estimado | ~150h / 9 semanas |

**La base del documento es sólida.** La arquitectura feature-based, el uso de Repository Pattern, Server Actions con Zod, y RLS en BD son decisiones correctas. Los problemas principales son: ambigüedad con Cal.com, constraint de doble booking insuficiente, RLS recursivo, y falta de manejo de estado transitorio (reserva temporal de slots). Todos son corregibles antes de iniciar desarrollo.
