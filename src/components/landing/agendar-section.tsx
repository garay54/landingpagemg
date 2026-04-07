'use client';

import type { Servicio } from '@/features/citas/types';
import { WizardAgendar } from '@/features/citas/components/wizard-agendar';
import { Badge } from '@/components/ui/badge';

interface AgendarSectionProps {
  servicios: Servicio[];
  diasBloqueados: string[];
  servicioPreseleccionado?: string | null;
}

export function AgendarSection({
  servicios,
  diasBloqueados,
  servicioPreseleccionado,
}: AgendarSectionProps) {
  return (
    <section id="agendar" className="section-padding bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider">
            Agendar
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Agenda tu cita
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Selecciona un servicio, fecha y horario disponible
          </p>
        </div>

        {/* Wizard container with glass effect */}
        <div className="mx-auto mt-12 max-w-2xl">
          <div className="glass rounded-2xl p-6 shadow-xl shadow-primary/5 sm:p-8">
            <WizardAgendar
              servicios={servicios}
              diasBloqueados={diasBloqueados}
              servicioPreseleccionado={servicioPreseleccionado}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
