import { LoginForm } from '@/features/auth/components/login-form';

export const metadata = {
  title: 'Iniciar sesión',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <LoginForm />
    </div>
  );
}
