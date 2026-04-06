import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const recuperarContrasenaSchema = z.object({
  email: z.string().email('Email inválido'),
});

export type LoginDTO = z.infer<typeof loginSchema>;
export type RecuperarContrasenaDTO = z.infer<typeof recuperarContrasenaSchema>;

export type AuthActionResult = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};
