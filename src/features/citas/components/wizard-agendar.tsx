'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Servicio } from '@/features/citas/types';
import { agendarCitaAction } from '@/features/citas/actions';
import { agendarCitaSchema } from '@/lib/validations/cita.schema';
import { SelectorServicio } from './selector-servicio';
import { CalendarioDisponibilidad } from './calendario-disponibilidad';
import { SelectorHora } from './selector-hora';
import { FormularioPaciente } from './formulario-paciente';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WizardAgendarProps {
  servicios: Servicio[];
  diasBloqueados: string[];
}

type Paso = 'servicio' | 'fecha' | 'hora' | 'datos' | 'confirmar';

const PASOS: { key: Paso; label: string }[] = [
  { key: 'servicio', label: 'Servicio' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'hora', label: 'Hora' },
  { key: 'datos', label: 'Datos' },
  { key: 'confirmar', label: 'Confirmar' },
];

export function WizardAgendar({ servicios, diasBloqueados }: WizardAgendarProps) {
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>('servicio');
  const [servicioId, setServicioId] = useState<string | null>(null);
  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [datosPaciente, setDatosPaciente] = useState({
    nombre_paciente: '',
    email_paciente: '',
    telefono_paciente: '',
    notas: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const servicioSeleccionado = servicios.find((s) => s.id === servicioId);
  const pasoActualIndex = PASOS.findIndex((p) => p.key === paso);

  function handleSeleccionarServicio(id: string) {
    setServicioId(id);
    setFecha(null);
    setHora(null);
    setPaso('fecha');
  }

  function handleSeleccionarFecha(f: string) {
    setFecha(f);
    setHora(null);
    setPaso('hora');
  }

  function handleSeleccionarHora(h: string) {
    setHora(h);
    setPaso('datos');
  }

  function handleDatosCompletos() {
    // Validar en cliente antes de avanzar
    const result = agendarCitaSchema.safeParse({
      servicio_id: servicioId,
      fecha,
      hora_inicio: hora,
      ...datosPaciente,
    });

    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }

    setFieldErrors({});
    setPaso('confirmar');
  }

  function irAtras() {
    const anterior = PASOS[pasoActualIndex - 1];
    if (anterior) setPaso(anterior.key);
  }

  async function handleConfirmar() {
    if (!servicioId || !fecha || !hora) return;

    setIsSubmitting(true);
    setError(null);

    const result = await agendarCitaAction({
      servicio_id: servicioId,
      fecha,
      hora_inicio: hora,
      ...datosPaciente,
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
      setPaso('datos');
      setIsSubmitting(false);
      return;
    }

    if (result.data) {
      // TODO: Sprint 3 — redirigir a pago con citaId
      router.push(`/confirmacion?cita=${result.data.citaId}`);
    }
  }

  function formatearFecha(f: string): string {
    const date = new Date(f + 'T12:00:00');
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-1">
        {PASOS.map((p, i) => (
          <div key={p.key} className="flex flex-1 items-center">
            <div
              className={`h-2 w-full rounded-full ${
                i <= pasoActualIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Paso {pasoActualIndex + 1} de {PASOS.length}: {PASOS[pasoActualIndex].label}
      </p>

      {/* Error global */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Paso 1: Servicio */}
      {paso === 'servicio' && (
        <SelectorServicio
          servicios={servicios}
          seleccionado={servicioId}
          onSeleccionar={handleSeleccionarServicio}
        />
      )}

      {/* Paso 2: Fecha */}
      {paso === 'fecha' && (
        <>
          <CalendarioDisponibilidad
            seleccionada={fecha}
            onSeleccionar={handleSeleccionarFecha}
            diasBloqueados={diasBloqueados}
          />
          <Button variant="ghost" onClick={irAtras}>
            ← Cambiar servicio
          </Button>
        </>
      )}

      {/* Paso 3: Hora */}
      {paso === 'hora' && fecha && servicioSeleccionado && (
        <>
          <SelectorHora
            fecha={fecha}
            duracion={servicioSeleccionado.duracion}
            seleccionada={hora}
            onSeleccionar={handleSeleccionarHora}
          />
          <Button variant="ghost" onClick={irAtras}>
            ← Cambiar fecha
          </Button>
        </>
      )}

      {/* Paso 4: Datos del paciente */}
      {paso === 'datos' && (
        <>
          <FormularioPaciente
            datos={datosPaciente}
            onChange={setDatosPaciente}
            errores={fieldErrors}
          />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={irAtras}>
              ← Cambiar horario
            </Button>
            <Button onClick={handleDatosCompletos} className="flex-1">
              Continuar
            </Button>
          </div>
        </>
      )}

      {/* Paso 5: Confirmar */}
      {paso === 'confirmar' && servicioSeleccionado && fecha && hora && (
        <>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <h2 className="text-lg font-semibold">Confirma tu cita</h2>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Servicio</span>
                  <span className="text-sm font-medium">{servicioSeleccionado.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fecha</span>
                  <span className="text-sm font-medium">{formatearFecha(fecha)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Hora</span>
                  <span className="text-sm font-medium">{hora} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duración</span>
                  <span className="text-sm font-medium">{servicioSeleccionado.duracion} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Nombre</span>
                  <span className="text-sm font-medium">{datosPaciente.nombre_paciente}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm font-medium">{datosPaciente.email_paciente}</span>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <Badge className="text-base">${servicioSeleccionado.precio} MXN</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setPaso('datos')}>
              ← Editar datos
            </Button>
            <Button
              onClick={handleConfirmar}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Agendando...' : 'Confirmar cita'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
