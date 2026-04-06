import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getCitaById, getServicioById } from '@/features/citas/repository';
import { clientConfig } from '@/config/client.config';

export const metadata = {
  title: 'Cita confirmada',
};

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ cita?: string; status?: string }>;
}) {
  const params = await searchParams;
  const citaId = params.cita;
  const status = params.status;

  const esPendiente = status === 'pending';
  const cita = citaId ? await getCitaById(citaId) : null;
  const servicio = cita ? await getServicioById(cita.servicio_id) : null;

  function formatearFecha(fecha: string): string {
    const date = new Date(fecha + 'T12:00:00');
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center justify-center px-4">
      <Card className="w-full">
        <CardContent className="space-y-5 pt-6">
          <div className="text-center">
            <div className="text-4xl">{esPendiente ? '⏳' : '✓'}</div>
            <h1 className="mt-2 text-2xl font-bold">
              {esPendiente ? 'Pago en proceso' : 'Cita confirmada'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {esPendiente
                ? 'Tu pago está siendo procesado. Recibirás una confirmación cuando se apruebe.'
                : 'Tu pago fue aprobado y tu cita ha sido confirmada.'}
            </p>
          </div>

          {cita && servicio && (
            <>
              <Separator />

              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground">Detalles de tu cita</h2>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Servicio</span>
                  <span className="text-sm font-medium">{servicio.nombre}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fecha</span>
                  <span className="text-sm font-medium">{formatearFecha(cita.fecha)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Hora</span>
                  <span className="text-sm font-medium">{cita.hora_inicio} — {cita.hora_fin} hrs</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duración</span>
                  <span className="text-sm font-medium">{servicio.duracion} min</span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Nombre</span>
                  <span className="text-sm font-medium">{cita.nombre_paciente}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm font-medium">{cita.email_paciente}</span>
                </div>

                {cita.telefono_paciente && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Teléfono</span>
                    <span className="text-sm font-medium">{cita.telefono_paciente}</span>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <Badge className="text-base">${servicio.precio} {clientConfig.pagos.moneda}</Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="text-center text-sm text-muted-foreground">
                  <p className="font-medium">{clientConfig.negocio.nombre}</p>
                  {clientConfig.negocio.direccion && (
                    <p>{clientConfig.negocio.direccion}</p>
                  )}
                  {clientConfig.negocio.googleMapsUrl && (
                    <a
                      href={clientConfig.negocio.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-primary underline hover:no-underline"
                    >
                      Ver en Google Maps
                    </a>
                  )}
                </div>

                <div className="flex gap-2">
                  <a
                    href={`tel:${clientConfig.negocio.telefono.replace(/\s/g, '')}`}
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full text-sm">
                      Llamar
                    </Button>
                  </a>
                  {clientConfig.negocio.whatsapp && (
                    <a
                      href={`https://wa.me/${clientConfig.negocio.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full text-sm">
                        WhatsApp
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </>
          )}

          <Link href="/">
            <Button className="w-full">Volver al inicio</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
