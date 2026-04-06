import { redirect } from 'next/navigation';
import { PagoClient } from '@/features/pagos/components/pago-client';

export const metadata = {
  title: 'Pago',
};

export default async function PagoPage({
  searchParams,
}: {
  searchParams: Promise<{ cita?: string; status?: string }>;
}) {
  const params = await searchParams;
  const citaId = params.cita;
  const status = params.status;

  if (!citaId) {
    redirect('/agendar');
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center justify-center px-4">
      <PagoClient citaId={citaId} failedStatus={status === 'failed'} />
    </div>
  );
}
