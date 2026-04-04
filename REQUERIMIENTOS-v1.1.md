# Documento de Requerimientos — Base Template
## Páginas Web para Profesionistas | v1.1

**Autor:** Mario Alberto
**Stack:** Next.js · TypeScript · Tailwind · Supabase · Vercel · MercadoPago · Resend
**Propósito:** Template reutilizable para sitios de profesionistas en LATAM
**Estado:** v1.1 — Corregido con análisis de arquitectura

---

> Este documento define los requerimientos funcionales, no funcionales, de seguridad y arquitectura para construir el template base que será reutilizado en todos los proyectos subsecuentes. **Todos los módulos deben funcionar correctamente antes de personalizar para cualquier cliente.**

---

## Índice

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura y Patrones](#3-arquitectura-y-patrones)
4. [Esquema de Base de Datos](#4-esquema-de-base-de-datos)
5. [Requerimientos Funcionales](#5-requerimientos-funcionales)
6. [Requerimientos de Seguridad](#6-requerimientos-de-seguridad)
7. [Flujo de Trabajo y Desarrollo](#7-flujo-de-trabajo-y-desarrollo)
8. [Requerimientos No Funcionales](#8-requerimientos-no-funcionales)

---

## 1. Visión General

El objetivo es construir un template web funcional, seguro y reutilizable para profesionistas de servicios (nutriólogos, psicólogos, dentistas, etc.) en Latinoamérica. El template incluye las funcionalidades core que se repiten en todos los proyectos, con arquitectura que permite personalización por cliente con el mínimo esfuerzo posible.

### 1.1 Objetivos

- Construir la infraestructura una sola vez y reutilizarla en todos los proyectos
- Reducir el tiempo de entrega por cliente de semanas a días
- Garantizar seguridad desde el inicio en todos los proyectos
- Minimizar deuda técnica con patrones de código mantenibles
- Separar configuración de cliente del código base

### 1.2 Alcance del Template Base

> **El template base NO está personalizado para ningún cliente.** Contiene infraestructura y lógica de negocio genérica. La personalización visual y de contenido se hace en capa separada sobre esta base.

Incluye:
- Sistema completo de autenticación (registro, login, recuperación de contraseña)
- Agendamiento de citas con manejo de disponibilidad y reserva temporal de slots
- Pasarela de pagos con MercadoPago (Sandbox y Producción)
- Emails transaccionales automáticos (confirmación, recordatorio, recibo)
- Panel de administración básico para el profesionista
- Base de datos normalizada y segura con RLS
- Sistema de configuración por cliente mediante un solo archivo

---

## 2. Stack Tecnológico

| Tecnología | Propósito | Justificación |
|---|---|---|
| **Next.js 14+** | Framework frontend y backend (App Router) | Serverless nativo, SSR, soporte Vercel perfecto |
| **TypeScript** | Tipado estático en todo el proyecto | Reduce bugs, mejora mantenibilidad a largo plazo |
| **Tailwind CSS** | Estilos y diseño responsivo | Rápido, sin conflictos de CSS global |
| **shadcn/ui** | Componentes UI base (Button, Input, Card, etc.) | Componentes copiados al proyecto, personalizables, integración nativa con Tailwind |
| **Supabase** | PostgreSQL + Auth + Storage | RLS nativo, backups automáticos, tiempo real |
| **Vercel** | Hosting y deploy automático | Integración perfecta con Next.js, CDN global |
| **MercadoPago** | Procesamiento de pagos LATAM | Dominante en México, API madura y bien documentada |
| **Resend** | Emails transaccionales | Simplicidad, SDK React Email, plan free generoso |
| **Zod** | Validación de esquemas | Validación tipo-segura en cliente y servidor |
| **React Hook Form** | Manejo de formularios | Performance, integración nativa con Zod |
| **date-fns + date-fns-tz** | Manejo de fechas y timezones | Ligero, tree-shakeable, soporte de zonas horarias |
| **@upstash/ratelimit** | Rate limiting en API Routes | Compatible con serverless (Vercel), basado en Redis |

> ⚠️ **TypeScript es obligatorio en todo el proyecto.** El uso de `any` como tipo está prohibido salvo excepciones documentadas. No debe existir ningún archivo `.js` en el proyecto.

> ℹ️ **Cal.com fue evaluado y descartado.** El sistema de agendamiento se construye propio porque: (a) el esquema de BD ya está definido, (b) evita dependencia externa y complejidad de sincronización, (c) el scope de agendamiento es viable de implementar.

---

## 3. Arquitectura y Patrones

### 3.1 Estructura de Carpetas

Se utiliza **Feature-Based Architecture**: cada funcionalidad agrupa sus propios componentes, hooks, types y utilidades. No se separa por tipo de archivo.

```
src/
  app/                          # Next.js App Router
    (auth)/                     # Grupo: rutas de autenticación
      login/
        page.tsx
      register/
        page.tsx
      recuperar-contrasena/
        page.tsx
    (dashboard)/                # Grupo: rutas protegidas del profesionista
      dashboard/
        page.tsx
      citas/
        page.tsx
      servicios/
        page.tsx
    (public)/                   # Grupo: rutas públicas del paciente
      page.tsx                  # Landing page
      agendar/
        page.tsx
      pago/
        page.tsx
      confirmacion/
        page.tsx
      terminos/
        page.tsx
      privacidad/
        page.tsx
    api/                        # API Routes serverless
      pagos/
        crear-preferencia/
          route.ts
      webhooks/
        mercadopago/
          route.ts
      citas/
        disponibilidad/
          route.ts
      health/
        route.ts                # Health check endpoint
    not-found.tsx               # Página 404 personalizada
    error.tsx                   # Error boundary global
    loading.tsx                 # Loading state global

  features/                     # Lógica de negocio por funcionalidad
    auth/
      components/               # LoginForm, RegisterForm
      hooks/                    # useAuth, useSession
      actions.ts                # Server actions de auth
      types.ts
    citas/
      components/               # CalendarioDisponibilidad, TarjetaCita
      hooks/                    # useCitas, useDisponibilidad
      repository.ts             # Queries a Supabase
      actions.ts                # Server actions de citas
      types.ts
    pagos/
      components/               # WidgetMercadoPago
      hooks/                    # usePago
      repository.ts
      actions.ts
      types.ts
    emails/
      templates/                # Componentes React Email
        ConfirmacionCita.tsx
        ReciboPago.tsx
        Recordatorio.tsx
      sender.ts                 # Funciones de envío con Resend

  components/                   # Componentes UI reutilizables (sin lógica de negocio)
    ui/                         # shadcn/ui components (Button, Input, Card, Modal, Badge...)
    layout/                     # Navbar, Footer, Sidebar

  lib/                          # Instancias de servicios y utilidades
    supabase/
      client.ts                 # Cliente para el browser
      server.ts                 # Cliente para servidor/server actions
      middleware.ts             # Cliente para middleware (cookies SSR)
      types.ts                  # Tipos generados por Supabase CLI
    mercadopago/
      client.ts                 # Instancia MP (lee secrets de process.env aquí)
      helpers.ts
    resend/
      client.ts
    validations/                # Schemas Zod compartidos
      cita.schema.ts
      pago.schema.ts
      auth.schema.ts

  config/
    client.config.ts            # ← EL ÚNICO ARCHIVO QUE CAMBIA POR CLIENTE (solo datos de negocio)

  types/                        # Tipos globales del proyecto
    index.ts

  middleware.ts                 # Protección de rutas por autenticación y rol
```

### 3.2 Archivo de Configuración por Cliente

> **Este es el principio de reutilización más importante del template.** Todo lo que varía entre clientes se centraliza aquí. El resto del código nunca hardcodea valores de cliente.

> ⚠️ **Este archivo contiene SOLO datos de negocio estáticos.** No debe importar `process.env` ni contener secrets. Los secrets se leen directamente en los módulos que los necesitan (`lib/mercadopago/client.ts`, etc.).

```typescript
// config/client.config.ts
export const clientConfig = {
  negocio: {
    nombre: 'Nombre del Profesionista',
    profesion: 'Nutrióloga',
    descripcion: 'Descripción breve del servicio',
    logo: '/logo.svg',
    email: 'contacto@negocio.com',
    telefono: '+52 667 000 0000',
    direccion: 'Dirección física si aplica',
    timezone: 'America/Mexico_City', // ← NUEVO: timezone del negocio
  },
  tema: {
    colorPrimario: '#2E6DA4',
    colorSecundario: '#27AE60',
    fuente: 'Inter',
  },
  servicios: [
    { id: 'consulta-inicial', nombre: 'Consulta Inicial', precio: 500, duracion: 60 },
    { id: 'seguimiento', nombre: 'Seguimiento', precio: 350, duracion: 45 },
  ],
  horarios: {
    diasHabiles: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    horaInicio: '09:00',
    horaFin: '18:00',
    duracionSlot: 60, // minutos
    // ← diasBloqueados REMOVIDO: ahora se gestiona desde BD (tabla horarios_bloqueados)
  },
  citas: {
    tiempoReservaMinutos: 15,    // ← NUEVO: TTL de reserva temporal de slot
    horasCancelacionMinima: 24,  // ← NUEVO: mínimo de horas antes para cancelar
  },
  pagos: {
    moneda: 'MXN',
  },
} as const;

export type ClientConfig = typeof clientConfig;
export type Servicio = ClientConfig['servicios'][number];
```

### 3.3 Patrones Obligatorios

#### Repository Pattern — acceso a datos

Nunca se hacen queries directas a Supabase desde componentes o páginas. Toda interacción con la base de datos pasa por funciones de repositorio.

```typescript
// features/citas/repository.ts
import { createClient } from '@/lib/supabase/server';
import type { Cita, CreateCitaDTO } from './types';

export async function getCitasByPaciente(pacienteId: string): Promise<Cita[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('citas')
    .select('*, servicios(nombre, precio)')
    .eq('paciente_id', pacienteId)
    .order('fecha', { ascending: true });

  if (error) throw new Error(`Error obteniendo citas: ${error.message}`);
  return data ?? [];
}

export async function createCita(dto: CreateCitaDTO): Promise<Cita> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('citas')
    .insert(dto)
    .select()
    .single();

  if (error) throw new Error(`Error creando cita: ${error.message}`);
  return data;
}
```

#### Server Actions para mutaciones

Las operaciones que modifican datos usan Server Actions de Next.js. Corren en servidor, lo que evita exponer lógica sensible al cliente.

```typescript
// features/citas/actions.ts
'use server';
import { createCitaSchema } from '@/lib/validations/cita.schema';
import { createCita } from './repository';
import { revalidatePath } from 'next/cache';

export async function agendarCitaAction(formData: unknown) {
  // 1. Validar con Zod antes de cualquier operación
  const parsed = createCitaSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  // 2. Verificar autenticación
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  // 3. Validar que la hora solicitada está dentro de horarios permitidos
  // y no está en horarios_bloqueados

  // 4. Ejecutar operación con estado 'reservado'
  const cita = await createCita({
    ...parsed.data,
    paciente_id: user.id,
    estado: 'reservado',
  });
  revalidatePath('/citas');
  return { data: cita };
}
```

#### Validación con Zod en ambos lados

Un schema Zod define la fuente de verdad del tipo de dato. Se usa para validar formularios en el cliente Y en el servidor.

```typescript
// lib/validations/cita.schema.ts
import { z } from 'zod';

export const createCitaSchema = z.object({
  servicio_id: z.string().uuid('ID de servicio inválido'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido'),
  notas: z.string().max(500).optional(),
});

export type CreateCitaDTO = z.infer<typeof createCitaSchema>;
```

---

## 4. Esquema de Base de Datos

> ⚠️ **REGLA ABSOLUTA: RLS activado en TODAS las tablas.** Ninguna tabla es accesible sin política explícita. Esta es la medida de seguridad más importante de toda la aplicación.

### 4.0 Función auxiliar: is_admin()

> ⚠️ **IMPORTANTE:** Esta función evita recursión infinita en las policies de RLS que verifican rol admin. Usa `SECURITY DEFINER` para ejecutar con permisos elevados.

```sql
-- Crear ANTES de cualquier policy que verifique rol admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND rol = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

### 4.1 Tabla: profiles

Extiende `auth.users` de Supabase. Se crea automáticamente con un trigger al registrarse.

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  apellido    TEXT NOT NULL,
  telefono    TEXT,
  avatar_url  TEXT,
  rol         TEXT NOT NULL DEFAULT 'paciente'
              CHECK (rol IN ('paciente', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nombre, apellido)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'apellido');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Usa is_admin() para evitar recursión
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (is_admin());
```

### 4.2 Tabla: servicios

```sql
CREATE TABLE servicios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  precio      NUMERIC(10,2) NOT NULL CHECK (precio > 0),
  duracion    INTEGER NOT NULL CHECK (duracion > 0), -- minutos
  activo      BOOLEAN DEFAULT TRUE,
  orden       INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "servicios_select_activos" ON servicios
  FOR SELECT USING (activo = TRUE);

CREATE POLICY "servicios_admin_all" ON servicios
  FOR ALL USING (is_admin());
```

### 4.3 Tabla: citas

```sql
-- Habilitar extensión para exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE citas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id     UUID NOT NULL REFERENCES profiles(id),
  servicio_id     UUID NOT NULL REFERENCES servicios(id),
  fecha           DATE NOT NULL,
  hora_inicio     TIME NOT NULL,
  hora_fin        TIME NOT NULL,
  estado          TEXT NOT NULL DEFAULT 'reservado'
                  CHECK (estado IN ('reservado','pendiente','confirmada','cancelada','completada')),
  notas           TEXT,
  cancelado_por   TEXT CHECK (cancelado_por IN ('paciente', 'admin')),
  reserva_expira  TIMESTAMPTZ, -- ← NUEVO: cuándo expira la reserva temporal
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  -- Evitar solapamiento: dos citas activas no pueden ocupar el mismo rango horario
  CONSTRAINT no_solapamiento EXCLUDE USING gist (
    fecha WITH =,
    tsrange(
      (fecha + hora_inicio)::timestamp,
      (fecha + hora_fin)::timestamp
    ) WITH &&
  ) WHERE (estado NOT IN ('cancelada'))
);

-- Índices para queries frecuentes
CREATE INDEX idx_citas_paciente       ON citas(paciente_id);
CREATE INDEX idx_citas_fecha          ON citas(fecha);
CREATE INDEX idx_citas_estado         ON citas(estado);
CREATE INDEX idx_citas_fecha_hora     ON citas(fecha, hora_inicio);
CREATE INDEX idx_citas_reserva_expira ON citas(reserva_expira) WHERE estado = 'reservado';

-- RLS
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "citas_select_own" ON citas
  FOR SELECT USING (auth.uid() = paciente_id);

CREATE POLICY "citas_insert_own" ON citas
  FOR INSERT WITH CHECK (auth.uid() = paciente_id);

CREATE POLICY "citas_update_own" ON citas
  FOR UPDATE USING (auth.uid() = paciente_id);

CREATE POLICY "citas_admin_all" ON citas
  FOR ALL USING (is_admin());
```

### 4.4 Tabla: pagos

```sql
CREATE TABLE pagos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cita_id             UUID NOT NULL REFERENCES citas(id),
  paciente_id         UUID NOT NULL REFERENCES profiles(id),
  mp_payment_id       TEXT UNIQUE,       -- ID de MercadoPago
  mp_preference_id    TEXT,
  monto               NUMERIC(10,2) NOT NULL CHECK (monto > 0),
  moneda              TEXT NOT NULL DEFAULT 'MXN',
  estado              TEXT NOT NULL DEFAULT 'pendiente'
                      CHECK (estado IN ('pendiente','aprobado','rechazado','cancelado','reembolsado')),
  metadata            JSONB DEFAULT '{}', -- datos extra de MP, sin datos de tarjeta
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ⚠️ NUNCA guardar datos de tarjeta en esta tabla
-- Solo IDs, montos y estados

CREATE INDEX idx_pagos_cita       ON pagos(cita_id);
CREATE INDEX idx_pagos_paciente   ON pagos(paciente_id);
CREATE INDEX idx_pagos_mp_id      ON pagos(mp_payment_id);

-- RLS
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pagos_select_own" ON pagos
  FOR SELECT USING (auth.uid() = paciente_id);

CREATE POLICY "pagos_admin_all" ON pagos
  FOR ALL USING (is_admin());
```

### 4.5 Tabla: horarios_bloqueados (NUEVA)

> Permite al admin bloquear fechas específicas desde el dashboard sin necesidad de redesplegar.

```sql
CREATE TABLE horarios_bloqueados (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha      DATE NOT NULL UNIQUE,
  motivo     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE horarios_bloqueados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "horarios_bloqueados_select_all" ON horarios_bloqueados
  FOR SELECT USING (TRUE); -- Todos pueden ver qué días están bloqueados

CREATE POLICY "horarios_bloqueados_admin_all" ON horarios_bloqueados
  FOR ALL USING (is_admin());
```

### 4.6 Función: limpiar reservas expiradas

```sql
-- Función que limpia reservas expiradas (llamada por cron de Supabase o pg_cron)
CREATE OR REPLACE FUNCTION limpiar_reservas_expiradas()
RETURNS void AS $$
BEGIN
  DELETE FROM citas
  WHERE estado = 'reservado'
    AND reserva_expira < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Programar ejecución cada 5 minutos (requiere pg_cron habilitado en Supabase)
-- SELECT cron.schedule('limpiar-reservas', '*/5 * * * *', 'SELECT limpiar_reservas_expiradas()');
```

---

## 5. Requerimientos Funcionales

### 5.1 Autenticación

| ID | Requerimiento | Prioridad |
|---|---|---|
| AUTH-01 | Registro con email y contraseña | Alta |
| AUTH-02 | Login con email y contraseña | Alta |
| AUTH-03 | Login con Google (OAuth) | Media |
| AUTH-04 | Recuperación de contraseña por email | Alta |
| AUTH-05 | Verificación de email al registrarse | Alta |
| AUTH-06 | Logout y limpieza de sesión | Alta |
| AUTH-07 | Protección de rutas por rol (paciente / admin) | Alta |
| AUTH-08 | Persistencia de sesión entre recargas | Alta |
| AUTH-09 | Rate limiting en login: máximo 10 intentos/min por IP | Alta |
| AUTH-10 | Rate limiting en registro: máximo 5 intentos/min por IP | Alta |

### 5.2 Agendamiento

| ID | Requerimiento | Prioridad |
|---|---|---|
| CITA-01 | Ver servicios disponibles con precios y duración | Alta |
| CITA-02 | Ver calendario con slots disponibles según horario del config y tabla `horarios_bloqueados` | Alta |
| CITA-03 | Seleccionar servicio, fecha y hora | Alta |
| CITA-04 | Prevenir solapamiento de citas con exclusion constraint en BD + validación en Server Action | Alta |
| CITA-05 | Reserva temporal de slot (TTL configurable, default 15 min) con limpieza automática | Alta |
| CITA-06 | Confirmar cita solo después de pago exitoso | Alta |
| CITA-07 | Cancelar cita con mínimo X horas de anticipación (configurable en `client.config.ts`) | Media |
| CITA-08 | Registrar quién cancela: paciente o admin (`cancelado_por`) | Media |
| CITA-09 | Ver historial de citas del paciente con paginación | Media |
| CITA-10 | Dashboard del admin: ver citas del día y próximas | Alta |
| CITA-11 | Validar en backend que la hora solicitada está dentro de horarios permitidos | Alta |
| CITA-12 | Mostrar todas las fechas/horas en timezone del negocio (configurado en `client.config.ts`) | Alta |

### 5.3 Pagos

| ID | Requerimiento | Prioridad |
|---|---|---|
| PAGO-01 | Crear preferencia de pago en MercadoPago desde el servidor | Alta |
| PAGO-02 | Renderizar widget Brick de MercadoPago en el cliente | Alta |
| PAGO-03 | Recibir webhook de confirmación de pago | Alta |
| PAGO-04 | Validar firma HMAC del webhook antes de procesar | Alta |
| PAGO-05 | Verificar que el monto del pago coincide con el precio del servicio en BD | Alta |
| PAGO-06 | Actualizar estado de cita a "confirmada" tras pago exitoso | Alta |
| PAGO-07 | Manejar pago rechazado sin confirmar la cita | Alta |
| PAGO-08 | Idempotencia: si webhook llega duplicado, no procesar dos veces | Alta |
| PAGO-09 | Procesar reembolso vía API de MercadoPago cuando cita se cancela dentro del plazo | Media |
| PAGO-10 | Ver historial de pagos del paciente con paginación | Media |

### 5.4 Emails Transaccionales

| ID | Requerimiento | Prioridad |
|---|---|---|
| EMAIL-01 | Email de bienvenida al registrarse | Media |
| EMAIL-02 | Email de confirmación de cita agendada y pagada | Alta |
| EMAIL-03 | Email de recibo de pago exitoso con detalle | Alta |
| EMAIL-04 | Recordatorio 24 horas antes de la cita (vía cron) | Media |
| EMAIL-05 | Email de cancelación de cita | Media |
| EMAIL-06 | Notificación al admin cuando llega una nueva cita | Media |

### 5.5 Páginas del Sistema

| Ruta | Descripción | Acceso |
|---|---|---|
| `/` | Landing page: servicios, precios, ubicación, CTA | Público |
| `/login` | Formulario de login | Público |
| `/register` | Formulario de registro | Público |
| `/recuperar-contrasena` | Recuperación de contraseña | Público |
| `/terminos` | Términos de servicio | Público |
| `/privacidad` | Política de privacidad | Público |
| `/agendar` | Flujo de agendamiento: servicio → fecha → hora | Paciente |
| `/pago` | Pago con widget de MercadoPago | Paciente |
| `/confirmacion` | Confirmación post-pago | Paciente |
| `/dashboard` | Resumen: próximas citas, historial | Paciente |
| `/dashboard/citas` | Listado completo de citas | Paciente |
| `/admin` | Dashboard del profesionista: citas del día | Admin |
| `/admin/citas` | Gestión de todas las citas | Admin |
| `/admin/servicios` | CRUD de servicios | Admin |
| `/admin/horarios` | Gestión de días bloqueados | Admin |

---

## 6. Requerimientos de Seguridad

> ⚠️ **Esta sección no es opcional.** Cada punto debe implementarse antes del primer deploy a producción.

### 6.1 Variables de Entorno

```bash
# .env.local — NUNCA subir a GitHub

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...        # Pública, puede ir al frontend
SUPABASE_SERVICE_ROLE_KEY=eyJ...             # PRIVADA — solo en servidor, nunca en cliente

# MercadoPago
NEXT_PUBLIC_MP_PUBLIC_KEY=TEST-xxx...        # Pública, va al widget del cliente
MP_ACCESS_TOKEN=TEST-xxx...                  # PRIVADA — solo en servidor
MP_WEBHOOK_SECRET=xxx...                     # Para validar firmas de webhooks

# Resend
RESEND_API_KEY=re_xxx...                     # PRIVADA

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://xxx...        # Para rate limiting serverless
UPSTASH_REDIS_REST_TOKEN=xxx...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000    # Cambiar a dominio real en producción
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` bypasea completamente el RLS. Usar únicamente en Server Actions o API Routes. **Jamás en componentes del cliente.**

### 6.2 Middleware de Protección de Rutas

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const RUTAS_PROTEGIDAS = ['/dashboard', '/agendar', '/pago', '/confirmacion'];
const RUTAS_SOLO_ADMIN = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Ruta protegida sin sesión → login
  const esProtegida = RUTAS_PROTEGIDAS.some(r => pathname.startsWith(r));
  if (esProtegida && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Ruta de admin sin rol admin → dashboard
  const esAdmin = RUTAS_SOLO_ADMIN.some(r => pathname.startsWith(r));
  if (esAdmin) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { data: perfil } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (perfil?.rol !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

### 6.3 Validación de Webhooks de MercadoPago

```typescript
// app/api/webhooks/mercadopago/route.ts
import { createHmac } from 'crypto';

export async function POST(req: Request) {
  const body = await req.text();
  const xSignature = req.headers.get('x-signature') ?? '';
  const xRequestId = req.headers.get('x-request-id') ?? '';

  // Extraer ts y hash del header x-signature
  const parts = Object.fromEntries(
    xSignature.split(',').map(p => p.trim().split('=') as [string, string])
  );
  const ts = parts['ts'];
  const receivedHash = parts['v1'];

  // Validar firma HMAC-SHA256
  const secret = process.env.MP_WEBHOOK_SECRET!;

  // Obtener data.id del body parseado
  const event = JSON.parse(body);
  const dataId = event?.data?.id;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expectedHash = createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');

  if (expectedHash !== receivedHash) {
    console.error('Webhook con firma inválida rechazado');
    return Response.json({ error: 'Firma inválida' }, { status: 401 });
  }

  // Idempotencia: verificar si ya fue procesado
  if (event.type === 'payment' && event.action === 'payment.updated') {
    await procesarPago(event.data.id);
  }

  return Response.json({ received: true });
}
```

### 6.4 Verificación de Monto en Servidor con Idempotencia

```typescript
// Nunca confiar en el monto que viene del frontend
// Siempre calcular el monto real desde la base de datos

async function procesarPago(mpPaymentId: string) {
  // 0. Idempotencia: si ya fue procesado, no hacer nada
  const pagoExistente = await getPagoPorMPPaymentId(mpPaymentId);
  if (pagoExistente?.estado === 'aprobado') {
    return; // Ya procesado, webhook duplicado
  }

  // 1. Obtener datos del pago desde MercadoPago
  const mpPayment = await mp.payment.get({ id: mpPaymentId });

  // 2. Obtener la cita pendiente asociada
  const pago = await getPagoPorPreferenceId(mpPayment.preference_id);
  if (!pago) return;

  const cita = await getCitaById(pago.cita_id);
  const servicio = await getServicioById(cita.servicio_id);

  // 3. Verificar que el monto cobrado coincide con el precio real
  if (mpPayment.transaction_amount !== servicio.precio) {
    console.error(`Monto incorrecto: cobrado ${mpPayment.transaction_amount}, esperado ${servicio.precio}`);
    return; // No confirmar la cita
  }

  // 4. Solo si el monto es correcto, confirmar la cita
  if (mpPayment.status === 'approved') {
    await confirmarCita(cita.id);
    await actualizarPago(pago.id, { estado: 'aprobado', mp_payment_id: mpPaymentId });
    await enviarEmailConfirmacion(cita);
  } else if (mpPayment.status === 'rejected') {
    await actualizarPago(pago.id, { estado: 'rechazado', mp_payment_id: mpPaymentId });
    // La reserva expirará automáticamente por TTL
  }
}
```

### 6.5 Rate Limiting

```typescript
// lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 intentos por minuto
  analytics: true,
});

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 requests por minuto
  analytics: true,
});
```

### 6.6 Checklist Pre-Deploy — Obligatorio

```
SEGURIDAD
[ ] .env.local está en .gitignore y NO está en el repositorio
[ ] RLS activado en TODAS las tablas de Supabase
[ ] Función is_admin() creada con SECURITY DEFINER
[ ] SUPABASE_SERVICE_ROLE_KEY solo se usa en server-side
[ ] Middleware protege todas las rutas privadas
[ ] Webhooks validan firma HMAC antes de procesar
[ ] Idempotencia implementada en procesamiento de webhooks
[ ] Monto del pago verificado en servidor contra precio real de BD
[ ] Validación Zod en TODOS los inputs del usuario (cliente y servidor)
[ ] Rate limiting activo en rutas de autenticación y API
[ ] client.config.ts NO contiene process.env ni secrets

INFRAESTRUCTURA
[ ] HTTPS activo en dominio de producción (automático con Vercel)
[ ] Backups automáticos activados en Supabase (requiere plan Pro)
[ ] Variables de entorno de producción configuradas en Vercel
[ ] Credenciales de MercadoPago cambiadas de TEST a producción
[ ] pg_cron habilitado para limpieza de reservas expiradas
[ ] Upstash Redis configurado para rate limiting

CÓDIGO
[ ] npm audit sin vulnerabilidades críticas o altas
[ ] Sin console.log con datos sensibles en producción
[ ] Sin claves hardcodeadas en el código
[ ] TypeScript sin errores (npx tsc --noEmit pasa limpio)
[ ] Todas las fechas se almacenan en UTC y se muestran en timezone del negocio

LEGAL
[ ] Página de términos de servicio con contenido del cliente
[ ] Página de política de privacidad (LFPDPPP para México)
```

---

## 7. Flujo de Trabajo y Desarrollo

### 7.1 Ambientes

| Variable | Local (Desarrollo) | Producción |
|---|---|---|
| `MP_ACCESS_TOKEN` | `TEST-xxxx` (Sandbox) | `APP_USR-xxxx` (Real) |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | `TEST-xxxx` (Sandbox) | `APP_USR-xxxx` (Real) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://cliente.com` |
| Pagos procesados | Dinero ficticio | Dinero real |
| Emails enviados | Resend en modo test | Resend producción |
| Webhooks | Via ngrok (desarrollo local) | URL pública directa |

### 7.2 Estrategia Git

```
main        ← producción, solo recibe merges desde develop
develop     ← desarrollo activo, siempre debe estar funcional
feature/*   ← ramas de funcionalidades (feature/auth, feature/pagos...)
```

```bash
# Flujo típico
git checkout develop
git checkout -b feature/modulo-pagos
# ... desarrollo y pruebas ...
git push origin feature/modulo-pagos
# Pull Request → develop
# Cuando develop está probado:
# Pull Request → main → Vercel hace deploy automático
```

### 7.3 Orden de Construcción Recomendado

1. **Setup inicial:** crear proyecto Next.js con TypeScript, configurar Tailwind, shadcn/ui, ESLint, instalar dependencias
2. **Configurar Supabase:** crear proyecto, ejecutar función `is_admin()`, luego todas las migrations de BD, activar RLS en cada tabla
3. **Variables de entorno:** configurar `.env.local`, verificar `.gitignore`
4. **Autenticación:** login, registro, recuperación de contraseña, verificación de email
5. **Middleware:** protección de rutas por autenticación y rol
6. **Rate limiting:** configurar Upstash Redis + rate limiters en auth
7. **Infraestructura de emails:** configurar Resend, crear templates base
8. **CRUD de servicios** (solo admin)
9. **Módulo de agendamiento:** calendario, disponibilidad, crear cita con reserva temporal, limpieza de expiradas
10. **Integración MercadoPago Sandbox:** crear preferencia, renderizar Brick, recibir webhook con idempotencia
11. **Lógica de confirmación:** webhook → verificar monto → confirmar cita → enviar email
12. **Dashboard de paciente:** próximas citas, historial, pagos (con paginación)
13. **Dashboard de admin:** citas del día, gestión, horarios bloqueados
14. **Landing page pública:** diseño, servicios, precios, CTA
15. **Páginas legales y de error:** términos, privacidad, 404, error boundary
16. **Pruebas end-to-end:** flujo completo desde landing hasta confirmación
17. **Checklist de seguridad:** verificar todos los puntos antes de producción
18. **Deploy:** configurar dominio, variables de entorno en Vercel, cambiar a credenciales de producción

---

## 8. Requerimientos No Funcionales

### 8.1 Rendimiento
- Lighthouse Performance Score: mínimo 85 en mobile
- First Contentful Paint: menos de 2 segundos
- Imágenes optimizadas con `next/image` en todos los casos
- Lazy loading en componentes pesados (widget de MercadoPago)
- Sin queries N+1: una operación = máximo 2 queries a la BD

### 8.2 Mantenibilidad
- TypeScript estricto en todo el proyecto, sin `any`
- Funciones con responsabilidad única (máximo ~50 líneas por función)
- Un solo archivo cambia entre clientes: `client.config.ts`
- Comentarios en lógica de negocio compleja, no en código obvio
- Cada módulo en `features/` debe ser independiente

### 8.3 Escalabilidad
- Arquitectura serverless: sin estado en servidor entre requests
- Índices en columnas de búsqueda frecuente (fecha, paciente_id, estado)
- RLS en BD en lugar de filtros manuales en código
- Paginación en todos los listados

### 8.4 Accesibilidad
- Formularios con labels asociados correctamente (`htmlFor`)
- Contraste de colores mínimo WCAG AA
- Navegación por teclado funcional en flujo crítico (agendar y pagar)
- Mensajes de error descriptivos en formularios

### 8.5 Timezone
- Todas las fechas se almacenan en UTC en la base de datos
- La zona horaria del negocio se configura en `client.config.ts`
- La UI muestra siempre en la zona horaria del negocio
- Usar `date-fns-tz` para conversiones

---

*Documento generado: Abril 2026 | Mario Alberto | v1.1 — Corregido con análisis de arquitectura*
