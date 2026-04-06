import { getServiciosActivos, getDiasBloqueados } from '@/features/citas/repository';
import { WizardAgendar } from '@/features/citas/components/wizard-agendar';

export const metadata = {
  title: 'Agendar cita',
};

export default async function AgendarPage() {
  const [servicios, diasBloqueados] = await Promise.all([
    getServiciosActivos(),
    getDiasBloqueados(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Agendar cita</h1>
        <p className="mt-2 text-muted-foreground">
          Selecciona un servicio, fecha y horario disponible
        </p>
      </div>

      <WizardAgendar
        servicios={servicios}
        diasBloqueados={diasBloqueados.map((d) => d.fecha)}
      />
    </div>
  );
}
