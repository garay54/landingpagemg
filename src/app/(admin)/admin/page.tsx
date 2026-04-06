import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogoutButton } from '@/features/auth/components/logout-button';

export const metadata = {
  title: 'Admin — Dashboard',
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const nombre = user.user_metadata?.nombre ?? 'Admin';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido, {nombre}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Visitas hoy</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Se activará con analytics</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Visitas esta semana</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Se activará con analytics</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Citas agendadas</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Total confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ingresos del mes</CardDescription>
            <CardTitle className="text-3xl">$0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">MXN</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Funnel de agendamiento</CardTitle>
            <CardDescription>
              Dónde abandonan los visitantes al intentar agendar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <FunnelStep label="Visitaron la página" value="—" />
            <FunnelStep label="Clickearon 'Agendar'" value="—" />
            <FunnelStep label="Seleccionaron servicio" value="—" />
            <FunnelStep label="Seleccionaron fecha/hora" value="—" />
            <FunnelStep label="Iniciaron pago" value="—" />
            <FunnelStep label="Completaron pago" value="—" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas citas</CardTitle>
            <CardDescription>Citas confirmadas próximas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Sin citas próximas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FunnelStep({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <span className="text-sm font-medium text-muted-foreground">{value}</span>
    </div>
  );
}
