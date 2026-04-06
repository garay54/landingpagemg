'use server';

import { agendarCitaSchema } from '@/lib/validations/cita.schema';
import { getServicioById, createCita } from './repository';
import { clientConfig } from '@/config/client.config';

export type AgendarResult = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: { citaId: string };
};

export async function agendarCitaAction(formData: unknown): Promise<AgendarResult> {
  const parsed = agendarCitaSchema.safeParse(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { servicio_id, fecha, hora_inicio, nombre_paciente, email_paciente, telefono_paciente, notas } = parsed.data;

  // Verificar que el servicio existe
  const servicio = await getServicioById(servicio_id);
  if (!servicio) {
    return { error: 'Servicio no encontrado' };
  }

  // Calcular hora_fin basada en la duración del servicio
  const [h, m] = hora_inicio.split(':').map(Number);
  const finMinutos = h * 60 + m + servicio.duracion;
  const finH = Math.floor(finMinutos / 60);
  const finM = finMinutos % 60;
  const hora_fin = `${String(finH).padStart(2, '0')}:${String(finM).padStart(2, '0')}`;

  // Validar que la hora está dentro del horario del negocio
  if (hora_inicio < clientConfig.horarios.horaInicio || hora_fin > clientConfig.horarios.horaFin) {
    return { error: 'El horario seleccionado está fuera del horario de atención' };
  }

  // Calcular expiración de reserva
  const reservaExpira = new Date();
  reservaExpira.setMinutes(reservaExpira.getMinutes() + clientConfig.citas.tiempoReservaMinutos);

  try {
    const cita = await createCita({
      servicio_id,
      fecha,
      hora_inicio,
      hora_fin,
      nombre_paciente,
      email_paciente,
      telefono_paciente: telefono_paciente || undefined,
      notas: notas || undefined,
      estado: 'reservado',
      reserva_expira: reservaExpira.toISOString(),
    });

    return { data: { citaId: cita.id } };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al agendar la cita';
    return { error: message };
  }
}
