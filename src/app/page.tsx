import { clientConfig } from '@/config/client.config';
import { getServiciosActivos, getDiasBloqueados } from '@/features/citas/repository';
import { LandingContent } from '@/components/landing/landing-content';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cita?: string; status?: string }>;
}) {
  const params = await searchParams;
  const citaId = params.cita ?? null;
  const paymentStatus = params.status ?? null;

  let servicios;
  let diasBloqueados: string[] = [];

  try {
    const [serviciosData, diasBloqueadosData] = await Promise.all([
      getServiciosActivos(),
      getDiasBloqueados(),
    ]);
    servicios = serviciosData;
    diasBloqueados = diasBloqueadosData.map((d) => d.fecha);
  } catch {
    // If Supabase is not configured yet, use services from config
    servicios = clientConfig.servicios.map((s, i) => ({
      id: s.id,
      nombre: s.nombre,
      descripcion: null,
      precio: s.precio,
      duracion: s.duracion,
      activo: true,
      orden: i,
      created_at: new Date().toISOString(),
    }));
  }

  return (
    <LandingContent
      servicios={servicios}
      diasBloqueados={diasBloqueados}
      citaId={citaId}
      paymentStatus={paymentStatus}
    />
  );
}
