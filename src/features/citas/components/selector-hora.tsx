'use client';

import { useEffect, useState } from 'react';
import type { SlotDisponible } from '@/features/citas/types';
import { Skeleton } from '@/components/ui/skeleton';

interface SelectorHoraProps {
  fecha: string;
  duracion: number;
  seleccionada: string | null;
  onSeleccionar: (hora: string) => void;
}

export function SelectorHora({ fecha, duracion, seleccionada, onSeleccionar }: SelectorHoraProps) {
  const [slots, setSlots] = useState<SlotDisponible[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/citas/disponibilidad?fecha=${fecha}&duracion=${duracion}`)
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.slots ?? []);
        setLoading(false);
      })
      .catch(() => {
        setSlots([]);
        setLoading(false);
      });
  }, [fecha, duracion]);

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Selecciona un horario</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Selecciona un horario</h2>
        <p className="text-sm text-muted-foreground">No hay horarios disponibles para esta fecha.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Selecciona un horario</h2>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((slot) => (
          <button
            key={slot.hora_inicio}
            onClick={() => onSeleccionar(slot.hora_inicio)}
            className={`rounded-md border p-2 text-center text-sm transition-colors ${
              seleccionada === slot.hora_inicio
                ? 'border-primary bg-primary text-primary-foreground'
                : 'hover:border-primary hover:bg-muted'
            }`}
          >
            {slot.hora_inicio}
          </button>
        ))}
      </div>
    </div>
  );
}
