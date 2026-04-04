export interface Cita {
  id: string;
  paciente_id: string;
  servicio_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'reservado' | 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  notas: string | null;
  cancelado_por: 'paciente' | 'admin' | null;
  reserva_expira: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCitaDTO {
  servicio_id: string;
  fecha: string;
  hora_inicio: string;
  notas?: string;
}
