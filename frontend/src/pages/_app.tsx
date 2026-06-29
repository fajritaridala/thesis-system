import { useState } from 'react';
import { HeroUIProvider } from '@heroui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { WagmiProvider } from 'wagmi';
import AppShell from '@/components/common/AppShell/AppShell';
import { config } from '@/lib/wagmi/config';
import '@/styles/index.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: false,
          },
        },
      })
  );

  return (
    <SessionProvider session={session}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <HeroUIProvider>
            <AppShell>
              <Component {...pageProps} />
            </AppShell>
          </HeroUIProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}

export default MyApp;
