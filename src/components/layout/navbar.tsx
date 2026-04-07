'use client';

import { useState } from 'react';
import { clientConfig } from '@/config/client.config';
import { Button } from '@/components/ui/button';
import { Calendar, Menu, X } from 'lucide-react';

const navLinks = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#como-funciona', label: 'Proceso' },
  { href: '#agendar', label: 'Agendar' },
  { href: '#ubicacion', label: 'Ubicación' },
  { href: '#contacto', label: 'Contacto' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { nombre } = clientConfig.negocio;

  function handleNavClick(href: string) {
    setIsOpen(false);
    const target = document.querySelector(href);
    target?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <header className="glass sticky top-0 z-50 w-full">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => handleNavClick('#inicio')}
          className="text-xl font-bold tracking-tight"
        >
          <span className="gradient-text">{nombre}</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </button>
          ))}
          <Button
            size="sm"
            className="ml-2 gap-1.5 rounded-full px-4 shadow-sm"
            onClick={() => handleNavClick('#agendar')}
          >
            <Calendar className="h-4 w-4" />
            Agendar
          </Button>
        </nav>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <nav className="glass border-t px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </button>
            ))}
            <Button
              size="sm"
              className="mt-2 gap-1.5 rounded-full"
              onClick={() => handleNavClick('#agendar')}
            >
              <Calendar className="h-4 w-4" />
              Agendar cita
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
