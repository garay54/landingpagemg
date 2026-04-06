'use client';

import type { Servicio } from '@/features/citas/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SelectorServicioProps {
  servicios: Servicio[];
  seleccionado: string | null;
  onSeleccionar: (id: string) => void;
}

export function SelectorServicio({ servicios, seleccionado, onSeleccionar }: SelectorServicioProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Selecciona un servicio</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {servicios.map((servicio) => (
          <Card
            key={servicio.id}
            className={`cursor-pointer transition-colors hover:border-primary ${
              seleccionado === servicio.id ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => onSeleccionar(servicio.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{servicio.nombre}</CardTitle>
            </CardHeader>
            <CardContent>
              {servicio.descripcion && (
                <p className="mb-2 text-sm text-muted-foreground">{servicio.descripcion}</p>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="secondary">${servicio.precio} MXN</Badge>
                <Badge variant="outline">{servicio.duracion} min</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
