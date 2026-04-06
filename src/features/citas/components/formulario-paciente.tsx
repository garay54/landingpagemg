'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PAISES = [
  { codigo: '+52', nombre: 'MX', bandera: '🇲🇽' },
  { codigo: '+1', nombre: 'US', bandera: '🇺🇸' },
] as const;

interface DatosPaciente {
  nombre_paciente: string;
  email_paciente: string;
  telefono_paciente: string;
  notas: string;
}

interface FormularioPacienteProps {
  datos: DatosPaciente;
  onChange: (datos: DatosPaciente) => void;
  errores?: Record<string, string[] | undefined>;
}

export function FormularioPaciente({ datos, onChange, errores }: FormularioPacienteProps) {
  const [codigoPais, setCodigoPais] = useState<string>(PAISES[0].codigo);
  const [telefonoLocal, setTelefonoLocal] = useState('');

  function actualizar(campo: keyof DatosPaciente, valor: string) {
    onChange({ ...datos, [campo]: valor });
  }

  function handleTelefonoChange(valor: string) {
    // Solo permitir dígitos
    const soloDigitos = valor.replace(/\D/g, '').slice(0, 10);
    setTelefonoLocal(soloDigitos);
    actualizar('telefono_paciente', `${codigoPais}${soloDigitos}`);
  }

  function handlePaisChange(codigo: string) {
    setCodigoPais(codigo);
    actualizar('telefono_paciente', `${codigo}${telefonoLocal}`);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Tus datos</h2>

      <div className="space-y-2">
        <Label htmlFor="nombre_paciente">Nombre completo *</Label>
        <Input
          id="nombre_paciente"
          placeholder="Juan Pérez"
          value={datos.nombre_paciente}
          onChange={(e) => actualizar('nombre_paciente', e.target.value)}
        />
        {errores?.nombre_paciente && (
          <p className="text-sm text-destructive">{errores.nombre_paciente[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email_paciente">Email *</Label>
        <Input
          id="email_paciente"
          type="email"
          placeholder="tu@email.com"
          value={datos.email_paciente}
          onChange={(e) => actualizar('email_paciente', e.target.value)}
        />
        {errores?.email_paciente && (
          <p className="text-sm text-destructive">{errores.email_paciente[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefono_paciente">Teléfono *</Label>
        <div className="flex gap-2">
          <select
            value={codigoPais}
            onChange={(e) => handlePaisChange(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {PAISES.map((pais) => (
              <option key={pais.codigo} value={pais.codigo}>
                {pais.bandera} {pais.nombre} ({pais.codigo})
              </option>
            ))}
          </select>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {codigoPais}
            </span>
            <Input
              id="telefono_paciente"
              type="tel"
              placeholder="6670000000"
              value={telefonoLocal}
              onChange={(e) => handleTelefonoChange(e.target.value)}
              className="pl-12"
              maxLength={10}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {telefonoLocal.length}/10 dígitos
        </p>
        {errores?.telefono_paciente && (
          <p className="text-sm text-destructive">{errores.telefono_paciente[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notas">Notas (opcional)</Label>
        <Input
          id="notas"
          placeholder="Algún detalle que quieras mencionar"
          value={datos.notas}
          onChange={(e) => actualizar('notas', e.target.value)}
        />
      </div>
    </div>
  );
}
