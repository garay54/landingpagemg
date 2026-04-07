import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { Cita, Servicio, HorarioBloqueado } from './types';

export async function getServiciosActivos(): Promise<Servicio[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true });

  if (error) throw new Error(`Error obteniendo servicios: ${error.message}`);
  return data ?? [];
}

export async function getServicioById(id: string): Promise<Servicio | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function getCitasByFecha(fecha: string): Promise<Cita[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .eq('fecha', fecha)
    .not('estado', 'eq', 'cancelada');

  if (error) throw new Error(`Error obteniendo citas: ${error.message}`);
  return data ?? [];
}

export async function getDiasBloqueados(): Promise<HorarioBloqueado[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('horarios_bloqueados')
    .select('*');

  if (error) throw new Error(`Error obteniendo días bloqueados: ${error.message}`);
  return data ?? [];
}

export async function createCita(cita: {
  servicio_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  nombre_paciente: string;
  email_paciente: string;
  telefono_paciente?: string;
  notas?: string;
  estado: string;
  reserva_expira: string;
}): Promise<Cita> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('citas')
    .insert(cita)
    .select()
    .single();

  if (error) {
    if (error.code === '23P01') {
      throw new Error('Este horario ya no está disponible. Por favor selecciona otro.');
    }
    throw new Error(`Error creando cita: ${error.message}`);
  }
  return data;
}

export async function getCitaById(id: string): Promise<Cita | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function actualizarEstadoCita(id: string, estado: string): Promise<void> {
  const supabase = await createAdminClient();
  const { error } = await supabase
    .from('citas')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(`Error actualizando cita: ${error.message}`);
}
