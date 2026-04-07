import { clientConfig } from '@/config/client.config';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const { nombre, email, telefono, whatsapp } = clientConfig.negocio;

  const currentYear = new Date().getFullYear();

  const secciones = [
    { href: '#inicio', label: 'Inicio' },
    { href: '#servicios', label: 'Servicios' },
    { href: '#como-funciona', label: 'Proceso' },
    { href: '#agendar', label: 'Agendar' },
    { href: '#ubicacion', label: 'Ubicación' },
    { href: '#contacto', label: 'Contacto' },
  ];

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="gradient-text text-lg font-bold">{nombre}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {clientConfig.negocio.profesion}
            </p>
            <div className="mt-4 space-y-1">
              <a
                href={`mailto:${email}`}
                className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {email}
              </a>
              <a
                href={`tel:${telefono.replace(/\s/g, '')}`}
                className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {telefono}
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold">Navegación</h3>
            <ul className="mt-3 space-y-2">
              {secciones.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold">Contacto rápido</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  💬 WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`tel:${telefono.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  📞 Llamar
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  ✉️ Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {nombre}. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <a
              href="/terminos"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Términos de servicio
            </a>
            <a
              href="/privacidad"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Política de privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
