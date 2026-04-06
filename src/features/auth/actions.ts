'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  loginSchema,
  recuperarContrasenaSchema,
  type AuthActionResult,
} from '@/lib/validations/auth.schema';

export async function loginAction(formData: unknown): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: 'Credenciales incorrectas' };
  }

  revalidatePath('/', 'layout');
  redirect('/admin');
}

export async function recuperarContrasenaAction(formData: unknown): Promise<AuthActionResult> {
  const parsed = recuperarContrasenaSchema.safeParse(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/admin`,
  });

  if (error) {
    return { error: 'Error al enviar el email. Intenta de nuevo.' };
  }

  return { success: 'Si el email existe, recibirás un enlace para restablecer tu contraseña.' };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
