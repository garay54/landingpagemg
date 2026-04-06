export const clientConfig = {
  negocio: {
    nombre: 'Nombre del Profesionista',
    profesion: 'Nutrióloga',
    descripcion: 'Descripción breve del servicio',
    logo: '/logo.svg',
    email: 'contacto@negocio.com',
    telefono: '+52 667 000 0000',
    direccion: 'Dirección física si aplica',
    timezone: 'America/Mexico_City',
  },
  tema: {
    colorPrimario: '#2E6DA4',
    colorSecundario: '#27AE60',
    fuente: 'Inter',
  },
  servicios: [
    { id: 'consulta-inicial', nombre: 'Consulta Inicial', precio: 500, duracion: 60 },
    { id: 'seguimiento', nombre: 'Seguimiento', precio: 350, duracion: 60 },
  ],
  horarios: {
    diasHabiles: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    horaInicio: '09:00',
    horaFin: '18:00',
    duracionSlot: 60,
  },
  citas: {
    tiempoReservaMinutos: 15,
    horasCancelacionMinima: 24,
  },
  pagos: {
    moneda: 'MXN',
  },
} as const;

export type ClientConfig = typeof clientConfig;
export type Servicio = ClientConfig['servicios'][number];
