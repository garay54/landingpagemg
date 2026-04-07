'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Clock, MapPin, Phone, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { clientConfig } from '@/config/client.config';

interface CitaResumen {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  nombre_paciente: string;
  email_paciente: string;
  servicio_nombre?: string;
  servicio_precio?: number;
}

interface ConfirmacionBannerProps {
  citaId: string;
  aprobado: boolean;
  pendiente: boolean;
  fallido: boolean;
}

export function ConfirmacionBanner({ citaId, aprobado, pendiente, fallido }: ConfirmacionBannerProps) {
  const [cita, setCita] = useState<CitaResumen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/citas/resumen?id=${citaId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setCita(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [citaId]);

  function formatFecha(fecha: string) {
    return new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  const { nombre, direccion, telefono, whatsapp, googleMapsUrl } = clientConfig.negocio;

  return (
    <section id="confirmacion-pago" className="section-padding">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

        {/* Status header */}
        {aprobado && (
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">¡Pago confirmado!</h2>
            <p className="text-muted-foreground">
              Tu cita está confirmada. Aquí tienes todos los detalles.
            </p>
          </div>
        )}

        {pendiente && (
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Pago en proceso</h2>
            <p className="text-muted-foreground">
              Tu pago está siendo verificado. Te avisaremos por correo cuando se confirme.
            </p>
          </div>
        )}

        {fallido && (
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Pago no completado</h2>
            <p className="text-muted-foreground">
              Hubo un problema con tu pago. Tu reserva sigue guardada por un tiempo.
              Puedes intentar pagar de nuevo o contactarnos.
            </p>
            <a
              href="/#agendar"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Intentar de nuevo
            </a>
          </div>
        )}

        {/* Appointment details card */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : cita ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Appointment info */}
            <div className="glass rounded-2xl p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Tu cita
              </h3>
              <dl className="space-y-3">
                {cita.servicio_nombre && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Servicio</dt>
                    <dd className="font-medium">{cita.servicio_nombre}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-muted-foreground">Fecha</dt>
                  <dd className="font-medium capitalize">{formatFecha(cita.fecha)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Horario</dt>
                  <dd className="font-medium">{cita.hora_inicio} — {cita.hora_fin} hrs</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Nombre</dt>
                  <dd className="font-medium">{cita.nombre_paciente}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Correo</dt>
                  <dd className="font-medium">{cita.email_paciente}</dd>
                </div>
                {cita.servicio_precio && (
                  <div className="border-t pt-3">
                    <dt className="text-xs text-muted-foreground">Total pagado</dt>
                    <dd className="text-lg font-bold text-primary">
                      ${cita.servicio_precio} MXN
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Professional / location info */}
            <div className="glass rounded-2xl p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Dónde acudir
              </h3>
              <p className="mb-1 font-semibold">{nombre}</p>

              {direccion && (
                <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{direccion}</span>
                </div>
              )}

              {/* Google Maps mini-embed */}
              {direccion && (
                <div className="mt-4 overflow-hidden rounded-xl border">
                  <iframe
                    title="Ubicación del consultorio"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed`}
                    width="100%"
                    height="180"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}

              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary underline underline-offset-2 hover:no-underline"
                >
                  Abrir en Google Maps →
                </a>
              )}

              {/* Contact buttons */}
              <div className="mt-6 flex gap-2">
                {telefono && (
                  <a
                    href={`tel:${telefono.replace(/\s/g, '')}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Llamar
                  </a>
                )}
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
