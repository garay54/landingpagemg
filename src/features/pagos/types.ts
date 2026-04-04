export interface Pago {
  id: string;
  cita_id: string;
  paciente_id: string;
  mp_payment_id: string | null;
  mp_preference_id: string | null;
  monto: number;
  moneda: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado' | 'reembolsado';
  metadata: Record<string, unknown>;
  created_at: string;
}
