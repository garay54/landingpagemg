import { clientConfig } from '@/config/client.config';

export default function HomePage() {
  const { nombre, profesion, descripcion } = clientConfig.negocio;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold">{nombre}</h1>
      <p className="text-xl text-muted-foreground">{profesion}</p>
      <p className="max-w-md text-center text-muted-foreground">{descripcion}</p>
      <p className="text-sm text-muted-foreground">
        Template base — Sprint 0 completado
      </p>
    </div>
  );
}
