export interface Cita {
  id: string;
  paciente_id: string | null;
  servicio_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'reservado' | 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  notas: string | null;
  nombre_paciente: string | null;
  email_paciente: string | null;
  telefono_paciente: string | null;
  cancelado_por: 'paciente' | 'admin' | null;
  reserva_expira: string | null;
  created_at: string;
  updated_at: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracion: number;
  activo: boolean;
  orden: number;
  created_at: string;
}

export interface HorarioBloqueado {
  id: string;
  fecha: string;
  motivo: string | null;
}

export interface SlotDisponible {
  hora_inicio: string;
  hora_fin: string;
}
