import { clientConfig } from '@/config/client.config';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MessageCircle } from 'lucide-react';

const CANALES = [
  {
    icon: MessageCircle,
    titulo: 'WhatsApp',
    descripcion: 'Escríbenos por WhatsApp para cualquier duda',
    getHref: () => `https://wa.me/${clientConfig.negocio.whatsapp}`,
    getLabel: () => clientConfig.negocio.telefono,
    gradient: 'from-green-500/10 to-green-500/5',
    iconColor: 'text-green-600',
  },
  {
    icon: Phone,
    titulo: 'Teléfono',
    descripcion: 'Llámanos en horario de atención',
    getHref: () => `tel:${clientConfig.negocio.telefono.replace(/\s/g, '')}`,
    getLabel: () => clientConfig.negocio.telefono,
    gradient: 'from-blue-500/10 to-blue-500/5',
    iconColor: 'text-blue-600',
  },
  {
    icon: Mail,
    titulo: 'Email',
    descripcion: 'Envíanos un correo electrónico',
    getHref: () => `mailto:${clientConfig.negocio.email}`,
    getLabel: () => clientConfig.negocio.email,
    gradient: 'from-purple-500/10 to-purple-500/5',
    iconColor: 'text-purple-600',
  },
];

export function ContactoSection() {
  return (
    <section id="contacto" className="section-padding bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider">
            Contacto
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            ¿Tienes dudas?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Estamos para ayudarte. Contáctanos por cualquiera de estos medios.
          </p>
        </div>

        {/* Contact cards */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
          {CANALES.map((canal) => {
            const Icon = canal.icon;
            return (
              <a
                key={canal.titulo}
                href={canal.getHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${canal.gradient}`}>
                      <Icon className={`h-7 w-7 ${canal.iconColor}`} />
                    </div>
                    <h3 className="mb-1 font-semibold">{canal.titulo}</h3>
                    <p className="mb-3 text-xs text-muted-foreground">{canal.descripcion}</p>
                    <span className="text-sm font-medium text-primary group-hover:underline">
                      {canal.getLabel()}
                    </span>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
