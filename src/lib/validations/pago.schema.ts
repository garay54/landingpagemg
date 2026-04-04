import { z } from 'zod';

export const createPagoSchema = z.object({
  cita_id: z.string().uuid('ID de cita inválido'),
});

export type CreatePagoDTO = z.infer<typeof createPagoSchema>;
