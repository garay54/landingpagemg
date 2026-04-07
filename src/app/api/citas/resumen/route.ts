import { NextRequest } from 'next/server';
import { getCitaById, getServicioById } from '@/features/citas/repository';

/**
 * GET /api/citas/resumen?id=<cita_id>
 * Returns a lightweight summary of an appointment + its service,
 * suitable for the post-payment confirmation banner (no auth required).
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');

  if (!id) {
    return Response.json({ error: 'Falta el parámetro id' }, { status: 400 });
  }

  const cita = await getCitaById(id);
  if (!cita) {
    return Response.json({ error: 'Cita no encontrada' }, { status: 404 });
  }

  const servicio = await getServicioById(cita.servicio_id);

  return Response.json({
    fecha: cita.fecha,
    hora_inicio: cita.hora_inicio,
    hora_fin: cita.hora_fin,
    nombre_paciente: cita.nombre_paciente,
    email_paciente: cita.email_paciente,
    servicio_nombre: servicio?.nombre ?? null,
    servicio_precio: servicio ? Number(servicio.precio) : null,
  });
}
