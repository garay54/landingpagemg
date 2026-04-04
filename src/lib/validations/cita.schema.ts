import { z } from 'zod';

export const createCitaSchema = z.object({
  servicio_id: z.string().uuid('ID de servicio inválido'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido'),
  notas: z.string().max(500).optional(),
});

export type CreateCitaDTO = z.infer<typeof createCitaSchema>;
