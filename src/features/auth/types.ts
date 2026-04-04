export interface Profile {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  avatar_url: string | null;
  rol: 'paciente' | 'admin';
  created_at: string;
  updated_at: string;
}
