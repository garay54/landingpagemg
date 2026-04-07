import { Badge } from '@/components/ui/badge';
import { CalendarCheck, CreditCard, CheckCircle } from 'lucide-react';

const PASOS = [
  {
    icon: CalendarCheck,
    titulo: 'Elige servicio y fecha',
    descripcion: 'Selecciona el servicio que necesitas, elige una fecha y horario disponible que se ajuste a tu agenda.',
    color: 'from-primary/20 to-primary/5',
  },
  {
    icon: CreditCard,
    titulo: 'Paga en línea',
    descripcion: 'Realiza tu pago de forma segura con MercadoPago. Tu cita queda confirmada al instante.',
    color: 'from-chart-2/20 to-chart-2/5',
  },
  {
    icon: CheckCircle,
    titulo: 'Asiste a tu cita',
    descripcion: 'Recibirás un correo de confirmación y un recordatorio 24 horas antes de tu cita.',
    color: 'from-chart-4/20 to-chart-4/5',
  },
];

export function ComoFuncionaSection() {
  return (
    <section id="como-funciona" className="section-padding">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider">
            Proceso
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            ¿Cómo funciona?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Agenda tu cita en 3 sencillos pasos
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {PASOS.map((paso, index) => {
            const Icon = paso.icon;
            return (
              <div key={paso.titulo} className="group relative text-center">
                {/* Connector line (hidden on mobile and for the last item) */}
                {index < PASOS.length - 1 && (
                  <div className="absolute left-1/2 top-12 hidden h-px w-full bg-gradient-to-r from-border to-transparent md:block" />
                )}

                {/* Step number + icon */}
                <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${paso.color} transition-transform group-hover:scale-110`} />
                  <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-lg">
                    {index + 1}
                  </div>
                  <Icon className="relative h-10 w-10 text-primary" />
                </div>

                <h3 className="mb-3 text-lg font-semibold">{paso.titulo}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {paso.descripcion}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
