import { NextRequest } from 'next/server';
import { z } from 'zod';
import { preferenceClient } from '@/lib/mercadopago/client';
import { getCitaById, getServicioById } from '@/features/citas/repository';
import { createPago } from '@/features/pagos/repository';
import { clientConfig } from '@/config/client.config';

const schema = z.object({
  cita_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: 'ID de cita inválido' }, { status: 400 });
  }

  const cita = await getCitaById(parsed.data.cita_id);
  if (!cita) {
    return Response.json({ error: 'Cita no encontrada' }, { status: 404 });
  }

  if (cita.estado !== 'reservado') {
    return Response.json({ error: 'Esta cita ya fue procesada' }, { status: 400 });
  }

  const servicio = await getServicioById(cita.servicio_id);
  if (!servicio) {
    return Response.json({ error: 'Servicio no encontrado' }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const isLocalhost = appUrl.includes('localhost');

  try {
    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            id: cita.id,
            title: `${servicio.nombre} — ${clientConfig.negocio.nombre}`,
            description: `Cita: ${cita.fecha} a las ${cita.hora_inicio}`,
            quantity: 1,
            unit_price: Number(servicio.precio),
            currency_id: clientConfig.pagos.moneda,
          },
        ],
        payer: {
          email: cita.email_paciente ?? undefined,
          name: cita.nombre_paciente ?? undefined,
        },
        external_reference: cita.id,
        // MP rechaza localhost en back_urls y notification_url
        ...(isLocalhost
          ? {}
          : {
              back_urls: {
                success: `${appUrl}/confirmacion?cita=${cita.id}&status=approved`,
                failure: `${appUrl}/pago?cita=${cita.id}&status=failed`,
                pending: `${appUrl}/confirmacion?cita=${cita.id}&status=pending`,
              },
              auto_return: 'approved' as const,
              notification_url: `${appUrl}/api/webhooks/mercadopago`,
            }),
      },
    });

    // Registrar el pago pendiente en BD
    await createPago({
      cita_id: cita.id,
      mp_preference_id: preference.id!,
      monto: Number(servicio.precio),
      moneda: clientConfig.pagos.moneda,
    });

    return Response.json({
      preference_id: preference.id,
      init_point: preference.init_point,
    });
  } catch (err) {
    console.error('Error creando preferencia MP:', err);
    return Response.json(
      { error: 'Error al crear el pago. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
