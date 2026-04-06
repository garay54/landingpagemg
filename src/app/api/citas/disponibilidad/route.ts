import { NextRequest } from 'next/server';
import { clientConfig } from '@/config/client.config';
import { getCitasByFecha, getDiasBloqueados } from '@/features/citas/repository';
import type { SlotDisponible } from '@/features/citas/types';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const fecha = searchParams.get('fecha');
  const duracion = Number(searchParams.get('duracion')) || clientConfig.horarios.duracionSlot;

  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return Response.json({ error: 'Fecha inválida. Formato: YYYY-MM-DD' }, { status: 400 });
  }

  // Verificar que la fecha no sea pasada
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaDate = new Date(fecha + 'T00:00:00');
  if (fechaDate < hoy) {
    return Response.json({ slots: [] });
  }

  // Verificar que sea día hábil
  const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as const;
  const diaSemana = diasSemana[fechaDate.getUTCDay()];
  if (!(clientConfig.horarios.diasHabiles as readonly string[]).includes(diaSemana)) {
    return Response.json({ slots: [] });
  }

  // Verificar que no sea día bloqueado
  const diasBloqueados = await getDiasBloqueados();
  if (diasBloqueados.some((d) => d.fecha === fecha)) {
    return Response.json({ slots: [] });
  }

  // Obtener citas existentes para esa fecha (no canceladas)
  const citasExistentes = await getCitasByFecha(fecha);

  // Generar todos los slots posibles según horario del negocio
  const todosLosSlots = generarSlots(
    clientConfig.horarios.horaInicio,
    clientConfig.horarios.horaFin,
    duracion
  );

  // Filtrar slots ocupados
  const slotsDisponibles = todosLosSlots.filter((slot) => {
    return !citasExistentes.some((cita) => {
      return hayConflicto(slot.hora_inicio, slot.hora_fin, cita.hora_inicio, cita.hora_fin);
    });
  });

  return Response.json({ slots: slotsDisponibles });
}

function generarSlots(horaInicio: string, horaFin: string, duracionMinutos: number): SlotDisponible[] {
  const slots: SlotDisponible[] = [];
  let [h, m] = horaInicio.split(':').map(Number);
  const [finH, finM] = horaFin.split(':').map(Number);
  const finEnMinutos = finH * 60 + finM;

  while (true) {
    const inicioEnMinutos = h * 60 + m;
    const finSlotEnMinutos = inicioEnMinutos + duracionMinutos;

    if (finSlotEnMinutos > finEnMinutos) break;

    const inicio = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const finSlotH = Math.floor(finSlotEnMinutos / 60);
    const finSlotM = finSlotEnMinutos % 60;
    const fin = `${String(finSlotH).padStart(2, '0')}:${String(finSlotM).padStart(2, '0')}`;

    slots.push({ hora_inicio: inicio, hora_fin: fin });

    h = finSlotH;
    m = finSlotM;
  }

  return slots;
}

function hayConflicto(
  slotInicio: string,
  slotFin: string,
  citaInicio: string,
  citaFin: string
): boolean {
  // Dos rangos se solapan si uno empieza antes de que el otro termine
  return slotInicio < citaFin && slotFin > citaInicio;
}
