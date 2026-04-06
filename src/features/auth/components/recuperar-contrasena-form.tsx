'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { recuperarContrasenaSchema, type RecuperarContrasenaDTO } from '@/lib/validations/auth.schema';
import { recuperarContrasenaAction } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function RecuperarContrasenaForm() {
  const [serverMessage, setServerMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecuperarContrasenaDTO>({
    resolver: zodResolver(recuperarContrasenaSchema),
  });

  async function onSubmit(data: RecuperarContrasenaDTO) {
    setIsSubmitting(true);
    setServerMessage(null);

    const result = await recuperarContrasenaAction(data);

    if (result.error) {
      setServerMessage({ type: 'error', text: result.error });
    } else if (result.success) {
      setServerMessage({ type: 'success', text: result.success });
    }

    setIsSubmitting(false);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
        <CardDescription>
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {serverMessage && (
            <div
              className={`rounded-md p-3 text-sm ${
                serverMessage.type === 'error'
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-green-50 text-green-700'
              }`}
            >
              {serverMessage.text}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary underline">
              Volver al login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
