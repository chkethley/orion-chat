import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#05070f] via-[#060c1a] to-[#02040a] text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute right-[-120px] top-10 h-80 w-80 rounded-full bg-[#2de2a6]/18 blur-[140px]" />
        <div className="absolute bottom-[-160px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#4aa3ff]/12 blur-[160px]" />
      </div>

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 flex h-full w-full gap-4 p-4">
        {/* Sidebar */}
        <div className="w-72 shrink-0">
          <Sidebar />
        </div>

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/5 bg-card/70 backdrop-blur-2xl shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
          {/* Header */}
          <Header />

          {/* Chat area */}
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </div>
  );
}
