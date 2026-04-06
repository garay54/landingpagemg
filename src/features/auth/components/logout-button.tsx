'use client';

import { logoutAction } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button variant="outline" size="sm" type="submit">
        Cerrar sesión
      </Button>
    </form>
  );
}
