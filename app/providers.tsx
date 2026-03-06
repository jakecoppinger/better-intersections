'use client';
import { HelmetProvider } from '@dr.pogodin/react-helmet';

export function Providers({ children }: { children: React.ReactNode }) {
  return <HelmetProvider>{children}</HelmetProvider>;
}
