import { RecuperarContrasenaForm } from '@/features/auth/components/recuperar-contrasena-form';

export const metadata = {
  title: 'Recuperar contraseña',
};

export default function RecuperarContrasenaPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <RecuperarContrasenaForm />
    </div>
  );
}
