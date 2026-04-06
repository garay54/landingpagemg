-- =============================================
-- Template Profesional — Schema Inicial
-- =============================================
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query

-- 1. Extensión para exclusion constraints (evitar solapamiento de citas)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Función auxiliar: is_admin()
-- Evita recursión infinita en policies de RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND rol = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. Tabla: profiles
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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (is_admin());

-- Trigger: crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nombre, apellido, telefono)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
    NEW.raw_user_meta_data->>'telefono'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Tabla: servicios
CREATE TABLE servicios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  precio      NUMERIC(10,2) NOT NULL CHECK (precio > 0),
  duracion    INTEGER NOT NULL CHECK (duracion > 0),
  activo      BOOLEAN DEFAULT TRUE,
  orden       INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "servicios_select_activos" ON servicios
  FOR SELECT USING (activo = TRUE);

CREATE POLICY "servicios_admin_all" ON servicios
  FOR ALL USING (is_admin());

-- 5. Tabla: citas
CREATE TABLE citas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id     UUID REFERENCES profiles(id),
  servicio_id     UUID NOT NULL REFERENCES servicios(id),
  fecha           DATE NOT NULL,
  hora_inicio     TIME NOT NULL,
  hora_fin        TIME NOT NULL,
  estado          TEXT NOT NULL DEFAULT 'reservado'
                  CHECK (estado IN ('reservado','pendiente','confirmada','cancelada','completada')),
  notas           TEXT,
  nombre_paciente TEXT,
  email_paciente  TEXT,
  telefono_paciente TEXT,
  cancelado_por   TEXT CHECK (cancelado_por IN ('paciente', 'admin')),
  reserva_expira  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT no_solapamiento EXCLUDE USING gist (
    fecha WITH =,
    tsrange(
      (fecha + hora_inicio)::timestamp,
      (fecha + hora_fin)::timestamp
    ) WITH &&
  ) WHERE (estado NOT IN ('cancelada'))
);

CREATE INDEX idx_citas_fecha          ON citas(fecha);
CREATE INDEX idx_citas_estado         ON citas(estado);
CREATE INDEX idx_citas_fecha_hora     ON citas(fecha, hora_inicio);
CREATE INDEX idx_citas_reserva_expira ON citas(reserva_expira) WHERE estado = 'reservado';

ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar citas (pacientes anónimos)
CREATE POLICY "citas_insert_public" ON citas
  FOR INSERT WITH CHECK (TRUE);

-- Cualquiera puede ver su propia cita por email (se filtra en el código)
CREATE POLICY "citas_select_by_email" ON citas
  FOR SELECT USING (TRUE);

CREATE POLICY "citas_admin_all" ON citas
  FOR ALL USING (is_admin());

-- 6. Tabla: pagos
CREATE TABLE pagos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cita_id             UUID NOT NULL REFERENCES citas(id),
  mp_payment_id       TEXT UNIQUE,
  mp_preference_id    TEXT,
  monto               NUMERIC(10,2) NOT NULL CHECK (monto > 0),
  moneda              TEXT NOT NULL DEFAULT 'MXN',
  estado              TEXT NOT NULL DEFAULT 'pendiente'
                      CHECK (estado IN ('pendiente','aprobado','rechazado','cancelado','reembolsado')),
  metadata            JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pagos_cita   ON pagos(cita_id);
CREATE INDEX idx_pagos_mp_id  ON pagos(mp_payment_id);

ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pagos_select_public" ON pagos
  FOR SELECT USING (TRUE);

CREATE POLICY "pagos_admin_all" ON pagos
  FOR ALL USING (is_admin());

-- 7. Tabla: horarios_bloqueados
CREATE TABLE horarios_bloqueados (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha      DATE NOT NULL UNIQUE,
  motivo     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE horarios_bloqueados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "horarios_bloqueados_select_all" ON horarios_bloqueados
  FOR SELECT USING (TRUE);

CREATE POLICY "horarios_bloqueados_admin_all" ON horarios_bloqueados
  FOR ALL USING (is_admin());

-- 8. Función: limpiar reservas expiradas
CREATE OR REPLACE FUNCTION limpiar_reservas_expiradas()
RETURNS void AS $$
BEGIN
  DELETE FROM citas
  WHERE estado = 'reservado'
    AND reserva_expira < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Servicios de ejemplo
INSERT INTO servicios (nombre, descripcion, precio, duracion, orden) VALUES
  ('Consulta Inicial', 'Primera consulta de evaluación completa', 500.00, 60, 1),
  ('Seguimiento', 'Consulta de seguimiento y ajuste de plan', 350.00, 45, 2);
