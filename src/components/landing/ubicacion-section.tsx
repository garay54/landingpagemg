import { clientConfig } from '@/config/client.config';
import { Badge } from '@/components/ui/badge';
import { MapPin, ExternalLink, Clock } from 'lucide-react';

export function UbicacionSection() {
  const { direccion, googleMapsUrl } = clientConfig.negocio;
  const { diasHabiles, horaInicio, horaFin } = clientConfig.horarios;

  const diasFormateados = diasHabiles
    .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
    .join(', ');

  return (
    <section id="ubicacion" className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider">
            Ubicación
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            ¿Dónde estamos?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Visítanos en nuestro consultorio
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Map embed */}
          <div className="overflow-hidden rounded-2xl border shadow-lg">
            <iframe
              title="Ubicación del consultorio"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed`}
              width="100%"
              height="400"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[300px] w-full sm:h-[400px]"
            />
          </div>

          {/* Info card */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Dirección</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{direccion}</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Horario de atención</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {diasFormateados}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {horaInicio} — {horaFin} hrs
                  </p>
                </div>
              </div>
            </div>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir en Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
