import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { WhatsAppButton } from './WhatsAppButton';

// Note: <Toaster /> now lives once at the App root (src/App.tsx) so that
// toast.success()/toast.error() calls also work on pages rendered OUTSIDE
// this layout — e.g. /login and /register, which previously had no
// Toaster mounted at all and silently swallowed every error message.
export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
