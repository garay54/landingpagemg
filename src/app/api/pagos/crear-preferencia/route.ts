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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  // MP production tokens reject localhost back_urls — only set them on real deployments
  const isLocalhost = appUrl.includes('localhost') || appUrl.includes('127.0.0.1');

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
        // back_urls and notification_url require a public HTTPS URL.
        // On localhost we skip them so MP doesn't reject the preference.
        // On Vercel / production they are always set.
        ...(!isLocalhost && {
          back_urls: {
            success: `${appUrl}/?cita=${cita.id}&status=approved`,
            failure: `${appUrl}/?cita=${cita.id}&status=failed`,
            pending: `${appUrl}/?cita=${cita.id}&status=pending`,
          },
          auto_return: 'approved' as const,
          notification_url: `${appUrl}/api/webhooks/mercadopago`,
        }),
      },
    });

    // Register the pending payment record in DB
    await createPago({
      cita_id: cita.id,
      mp_preference_id: preference.id!,
      monto: Number(servicio.precio),
      moneda: clientConfig.pagos.moneda,
    });

    return Response.json({
      preference_id: preference.id,
      init_point: preference.init_point,
      cita_id: cita.id,
    });
  } catch (err) {
    console.error('Error creando preferencia MP:', err);
    return Response.json(
      { error: 'Error al crear el pago. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
