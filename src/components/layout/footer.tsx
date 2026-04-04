import Link from 'next/link';
import { clientConfig } from '@/config/client.config';

export function Footer() {
  const { nombre, email, telefono } = clientConfig.negocio;

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold">{nombre}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{email}</p>
            <p className="text-sm text-muted-foreground">{telefono}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Enlaces</h3>
            <ul className="mt-2 space-y-1">
              <li>
                <Link href="/agendar" className="text-sm text-muted-foreground hover:text-foreground">
                  Agendar cita
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-2 space-y-1">
              <li>
                <Link href="/terminos" className="text-sm text-muted-foreground hover:text-foreground">
                  Términos de servicio
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-sm text-muted-foreground hover:text-foreground">
                  Política de privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {nombre}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
