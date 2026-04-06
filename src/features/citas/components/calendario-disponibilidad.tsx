'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { clientConfig } from '@/config/client.config';

interface CalendarioDisponibilidadProps {
  seleccionada: string | null;
  onSeleccionar: (fecha: string) => void;
  diasBloqueados: string[];
}

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const NOMBRES_DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const DIAS_SEMANA_MAP: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6,
};

export function CalendarioDisponibilidad({
  seleccionada,
  onSeleccionar,
  diasBloqueados,
}: CalendarioDisponibilidadProps) {
  const hoy = new Date();
  const [mesActual, setMesActual] = useState(hoy.getMonth());
  const [anioActual, setAnioActual] = useState(hoy.getFullYear());

  const diasHabilesNumeros = clientConfig.horarios.diasHabiles.map((d) => DIAS_SEMANA_MAP[d]);

  const primerDiaMes = new Date(anioActual, mesActual, 1);
  const ultimoDiaMes = new Date(anioActual, mesActual + 1, 0);
  const primerDiaSemana = primerDiaMes.getDay();

  const dias: (number | null)[] = [];

  // Espacios vacíos antes del primer día
  for (let i = 0; i < primerDiaSemana; i++) {
    dias.push(null);
  }

  // Días del mes
  for (let d = 1; d <= ultimoDiaMes.getDate(); d++) {
    dias.push(d);
  }

  function esDiaHabil(dia: number): boolean {
    const fecha = new Date(anioActual, mesActual, dia);
    return diasHabilesNumeros.includes(fecha.getDay());
  }

  function esPasado(dia: number): boolean {
    const fecha = new Date(anioActual, mesActual, dia);
    const hoyInicio = new Date();
    hoyInicio.setHours(0, 0, 0, 0);
    return fecha < hoyInicio;
  }

  function estaBloqueado(dia: number): boolean {
    const fecha = formatearFecha(dia);
    return diasBloqueados.includes(fecha);
  }

  function formatearFecha(dia: number): string {
    const m = String(mesActual + 1).padStart(2, '0');
    const d = String(dia).padStart(2, '0');
    return `${anioActual}-${m}-${d}`;
  }

  function mesAnterior() {
    if (mesActual === 0) {
      setMesActual(11);
      setAnioActual(anioActual - 1);
    } else {
      setMesActual(mesActual - 1);
    }
  }

  function mesSiguiente() {
    if (mesActual === 11) {
      setMesActual(0);
      setAnioActual(anioActual + 1);
    } else {
      setMesActual(mesActual + 1);
    }
  }

  const puedRetroceder = anioActual > hoy.getFullYear() || mesActual > hoy.getMonth();

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Selecciona una fecha</h2>
      <div className="rounded-lg border p-4">
        {/* Header del mes */}
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={mesAnterior}
            disabled={!puedRetroceder}
          >
            ←
          </Button>
          <span className="text-sm font-medium">
            {NOMBRES_MESES[mesActual]} {anioActual}
          </span>
          <Button variant="ghost" size="sm" onClick={mesSiguiente}>
            →
          </Button>
        </div>

        {/* Nombres de días */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {NOMBRES_DIAS.map((nombre) => (
            <div key={nombre} className="text-center text-xs font-medium text-muted-foreground">
              {nombre}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1">
          {dias.map((dia, i) => {
            if (dia === null) {
              return <div key={`empty-${i}`} />;
            }

            const deshabilitado = !esDiaHabil(dia) || esPasado(dia) || estaBloqueado(dia);
            const fechaStr = formatearFecha(dia);
            const esSeleccionada = seleccionada === fechaStr;

            return (
              <button
                key={dia}
                disabled={deshabilitado}
                onClick={() => onSeleccionar(fechaStr)}
                className={`rounded-md p-2 text-center text-sm transition-colors ${
                  deshabilitado
                    ? 'cursor-not-allowed text-muted-foreground/30'
                    : esSeleccionada
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                }`}
              >
                {dia}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
