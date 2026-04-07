'use client';

import type { Servicio } from '@/features/citas/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, ArrowRight } from 'lucide-react';

interface ServiciosSectionProps {
  servicios: Servicio[];
  onSeleccionarServicio: (id: string) => void;
}

export function ServiciosSection({ servicios, onSeleccionarServicio }: ServiciosSectionProps) {
  return (
    <section id="servicios" className="section-padding bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider">
            Servicios
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Nuestros servicios
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Elige el servicio que necesitas y agenda tu cita en minutos
          </p>
        </div>

        {/* Services grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((servicio, index) => (
            <Card
              key={servicio.id}
              className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Top accent line */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60 opacity-0 transition-opacity group-hover:opacity-100" />

              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Clock className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{servicio.nombre}</CardTitle>
                {servicio.descripcion && (
                  <CardDescription className="text-sm">
                    {servicio.descripcion}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{servicio.duracion} min</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>${servicio.precio} MXN</span>
                  </div>
                </div>

                <Button
                  className="w-full gap-2 rounded-full transition-all"
                  onClick={() => onSeleccionarServicio(servicio.id)}
                >
                  Agendar
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
