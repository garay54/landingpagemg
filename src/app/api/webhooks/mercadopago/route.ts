import { createHmac } from 'crypto';
import { paymentClient } from '@/lib/mercadopago/client';
import { getPagoPorMPPaymentId, getPagoPorCitaId, actualizarPago } from '@/features/pagos/repository';
import { getCitaById, getServicioById, actualizarEstadoCita } from '@/features/citas/repository';

export async function POST(req: Request) {
  const body = await req.text();
  const xSignature = req.headers.get('x-signature') ?? '';
  const xRequestId = req.headers.get('x-request-id') ?? '';

  // Parse x-signature header
  const parts = Object.fromEntries(
    xSignature.split(',').map((p) => {
      const [key, ...vals] = p.trim().split('=');
      return [key, vals.join('=')] as [string, string];
    })
  );
  const ts = parts['ts'];
  const receivedHash = parts['v1'];

  const event = JSON.parse(body);
  const dataId = event?.data?.id;

  // Validate HMAC signature
  if (process.env.MP_WEBHOOK_SECRET && receivedHash) {
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const expectedHash = createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
      .update(manifest)
      .digest('hex');

    if (expectedHash !== receivedHash) {
      console.error('Webhook: firma HMAC inválida');
      return Response.json({ error: 'Firma inválida' }, { status: 401 });
    }
  }

  // Process payment notifications
  if (event.type === 'payment') {
    try {
      await procesarPago(String(dataId));
    } catch (err) {
      console.error('Error procesando pago:', err);
    }
  }

  // Always return 200 to avoid retries
  return Response.json({ received: true });
}

async function procesarPago(mpPaymentId: string) {
  // Idempotencia: si ya fue procesado, no hacer nada
  const pagoExistente = await getPagoPorMPPaymentId(mpPaymentId);
  if (pagoExistente?.estado === 'aprobado') {
    return;
  }

  // Obtener datos del pago desde MercadoPago
  const mpPayment = await paymentClient.get({ id: mpPaymentId });

  if (!mpPayment.external_reference) {
    console.error('Webhook: pago sin external_reference');
    return;
  }

  // Buscar la cita asociada
  const citaId = mpPayment.external_reference;
  const cita = await getCitaById(citaId);
  if (!cita) {
    console.error(`Webhook: cita ${citaId} no encontrada`);
    return;
  }

  const servicio = await getServicioById(cita.servicio_id);
  if (!servicio) {
    console.error(`Webhook: servicio ${cita.servicio_id} no encontrado`);
    return;
  }

  // Buscar el registro de pago por cita_id
  const pago = pagoExistente ?? await getPagoPorCitaId(citaId);
  if (!pago) {
    console.error(`Webhook: pago no encontrado para cita ${citaId}`);
    return;
  }

  // Verificar que el monto cobrado coincide con el precio del servicio
  if (mpPayment.transaction_amount !== Number(servicio.precio)) {
    console.error(
      `Webhook: monto incorrecto. Cobrado: ${mpPayment.transaction_amount}, esperado: ${servicio.precio}`
    );
    await actualizarPago(pago.id, {
      estado: 'rechazado',
      mp_payment_id: mpPaymentId,
      metadata: { error: 'monto_incorrecto' },
    });
    return;
  }

  if (mpPayment.status === 'approved') {
    await actualizarPago(pago.id, {
      estado: 'aprobado',
      mp_payment_id: mpPaymentId,
      metadata: {
        status_detail: mpPayment.status_detail,
        payment_method: mpPayment.payment_method_id,
      },
    });
    await actualizarEstadoCita(cita.id, 'confirmada');
  } else if (mpPayment.status === 'rejected') {
    await actualizarPago(pago.id, {
      estado: 'rechazado',
      mp_payment_id: mpPaymentId,
    });
  }
}
