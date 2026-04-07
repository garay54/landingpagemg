'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Servicio } from '@/features/citas/types';
import { HeroSection } from './hero-section';
import { ServiciosSection } from './servicios-section';
import { ComoFuncionaSection } from './como-funciona-section';
import { AgendarSection } from './agendar-section';
import { UbicacionSection } from './ubicacion-section';
import { ContactoSection } from './contacto-section';
import { ConfirmacionBanner } from './confirmacion-banner';

interface LandingContentProps {
  servicios: Servicio[];
  diasBloqueados: string[];
  /** cita_id returned in the URL by MercadoPago after payment */
  citaId?: string | null;
  /** MP payment status: 'approved' | 'pending' | 'failed' | null */
  paymentStatus?: string | null;
}

export function LandingContent({
  servicios,
  diasBloqueados,
  citaId,
  paymentStatus,
}: LandingContentProps) {
  const [servicioPreseleccionado, setServicioPreseleccionado] = useState<string | null>(null);
  const hasScrolled = useRef(false);

  const handleSeleccionarServicio = useCallback((id: string) => {
    setServicioPreseleccionado(id);
    setTimeout(() => {
      document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const pagoAprobado = paymentStatus === 'approved' && !!citaId;
  const pagoPendiente = paymentStatus === 'pending' && !!citaId;
  const pagoFallido = paymentStatus === 'failed' && !!citaId;
  const tieneResultadoPago = !!(citaId && paymentStatus);

  // After a successful/pending payment scroll to the confirmation banner
  useEffect(() => {
    if (tieneResultadoPago && !hasScrolled.current) {
      hasScrolled.current = true;
      setTimeout(() => {
        document.getElementById('confirmacion-pago')?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    }
  }, [tieneResultadoPago]);

  return (
    <>
      <HeroSection />
      <ServiciosSection
        servicios={servicios}
        onSeleccionarServicio={handleSeleccionarServicio}
      />
      <ComoFuncionaSection />
      <AgendarSection
        servicios={servicios}
        diasBloqueados={diasBloqueados}
        servicioPreseleccionado={servicioPreseleccionado}
      />
      <ContactoSection />

      {/* Post-payment confirmation — only shown after MP redirect */}
      {tieneResultadoPago && citaId && (
        <ConfirmacionBanner
          citaId={citaId}
          aprobado={pagoAprobado}
          pendiente={pagoPendiente}
          fallido={pagoFallido}
        />
      )}

      {/* Location revealed only on successful payment */}
      {pagoAprobado && <UbicacionSection />}
    </>
  );
}
