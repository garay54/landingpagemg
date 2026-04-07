'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface PagoClientProps {
  citaId: string;
  failedStatus: boolean;
}

export function PagoClient({ citaId, failedStatus }: PagoClientProps) {
  const [initPoint, setInitPoint] = useState<string | null>(null);
  const [returnCitaId, setReturnCitaId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pagos/crear-preferencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cita_id: citaId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setInitPoint(data.init_point);
          setReturnCitaId(data.cita_id ?? citaId);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Error al conectar con MercadoPago');
        setLoading(false);
      });
  }, [citaId]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="space-y-4 pt-6 text-center">
          <div className="text-4xl">✕</div>
          <h1 className="text-xl font-bold">Error</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.href = '/#agendar'} className="w-full">
            Volver a agendar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const returnUrl = returnCitaId
    ? `/?cita=${returnCitaId}&status=approved`
    : '/';

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 pt-6 text-center">
        {failedStatus && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            El pago no se pudo procesar. Intenta de nuevo.
          </div>
        )}
        <div className="text-4xl">💳</div>
        <h1 className="text-xl font-bold">Completar pago</h1>
        <p className="text-sm text-muted-foreground">
          Serás redirigido a MercadoPago para completar el pago de forma segura.
          Al finalizar, regresarás automáticamente aquí con la confirmación.
        </p>
        {initPoint && (
          <a href={initPoint}>
            <Button className="w-full">Pagar con MercadoPago</Button>
          </a>
        )}

        {/* Manual fallback — shown below the pay button */}
        <p className="pt-2 text-xs text-muted-foreground">
          ¿Ya completaste el pago y no fuiste redirigido?{' '}
          <a
            href={returnUrl}
            className="font-medium text-primary underline underline-offset-2 hover:no-underline"
          >
            Ver confirmación »
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
