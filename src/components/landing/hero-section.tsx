'use client';

import { clientConfig } from '@/config/client.config';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowDown } from 'lucide-react';

export function HeroSection() {
  const { nombre, profesion, descripcion } = clientConfig.negocio;

  return (
    <section
      id="inicio"
      className="hero-gradient relative flex min-h-[90vh] flex-col items-center justify-center px-4 text-center"
    >
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-32 bottom-32 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        {/* Badge */}
        <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Agenda tu cita hoy
        </div>

        {/* Heading */}
        <h1 className="animate-fade-up delay-100 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          {nombre}
        </h1>
        <p className="animate-fade-up delay-200 mt-4 text-xl font-medium text-primary sm:text-2xl">
          {profesion}
        </p>
        <p className="animate-fade-up delay-300 mx-auto mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
          {descripcion}
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-up delay-400 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="h-12 gap-2 rounded-full px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            onClick={() =>
              document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <Calendar className="h-5 w-5" />
            Agendar cita
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 rounded-full px-8 text-base"
            onClick={() =>
              document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Ver servicios
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="animate-fade-in delay-500 absolute bottom-8 flex flex-col items-center gap-2 text-muted-foreground">
        <span className="text-xs">Desliza para más</span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </div>
    </section>
  );
}
