import { z } from 'zod';

export const agendarCitaSchema = z.object({
  servicio_id: z.string().uuid('Selecciona un servicio'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecciona una fecha'),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Selecciona un horario'),
  nombre_paciente: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email_paciente: z.string().email('Email inválido'),
  telefono_paciente: z.string()
    .min(1, 'El teléfono es requerido')
    .refine((val) => {
      // Formato esperado: +{código}{10 dígitos} (ej: +526670001234 o +16670001234)
      return /^\+1\d{10}$/.test(val) || /^\+52\d{10}$/.test(val);
    }, 'El teléfono debe tener exactamente 10 dígitos'),
  notas: z.string().max(500).optional(),
});

export type AgendarCitaDTO = z.infer<typeof agendarCitaSchema>;
