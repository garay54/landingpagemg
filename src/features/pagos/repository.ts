import { createAdminClient } from '@/lib/supabase/server';
import type { Pago } from './types';

export async function createPago(pago: {
  cita_id: string;
  mp_preference_id: string;
  monto: number;
  moneda: string;
}): Promise<Pago> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('pagos')
    .insert(pago)
    .select()
    .single();

  if (error) throw new Error(`Error creando pago: ${error.message}`);
  return data;
}

export async function getPagoPorPreferenceId(preferenceId: string): Promise<Pago | null> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('pagos')
    .select('*')
    .eq('mp_preference_id', preferenceId)
    .single();

  if (error) return null;
  return data;
}

export async function getPagoPorMPPaymentId(mpPaymentId: string): Promise<Pago | null> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('pagos')
    .select('*')
    .eq('mp_payment_id', mpPaymentId)
    .single();

  if (error) return null;
  return data;
}

export async function getPagoPorCitaId(citaId: string): Promise<Pago | null> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('pagos')
    .select('*')
    .eq('cita_id', citaId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

export async function actualizarPago(
  id: string,
  update: { estado: string; mp_payment_id?: string; metadata?: Record<string, unknown> }
): Promise<void> {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from('pagos')
    .update(update)
    .eq('id', id);

  if (error) throw new Error(`Error actualizando pago: ${error.message}`);
}
