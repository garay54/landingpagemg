import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Cita agendada',
};

export default function ConfirmacionPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center justify-center px-4">
      <Card>
        <CardContent className="space-y-4 pt-6 text-center">
          <div className="text-4xl">✓</div>
          <h1 className="text-2xl font-bold">Cita reservada</h1>
          <p className="text-muted-foreground">
            Tu cita ha sido reservada exitosamente. Recibirás un email de confirmación con los detalles.
          </p>
          <p className="text-sm text-muted-foreground">
            Próximamente: integración de pago con MercadoPago para confirmar tu cita.
          </p>
          <Link href="/">
            <Button className="w-full">Volver al inicio</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
