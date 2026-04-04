// TODO: Generar con `npx supabase gen types typescript` después de crear las tablas
// Por ahora, placeholder vacío
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
