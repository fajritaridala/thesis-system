import type { AppProps } from "next/app";
import { useState } from "react";
import { HeroUIProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import AppShell from "@/components/common/AppShell/AppShell";
import "@/styles/globals.css";

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
      <QueryClientProvider client={queryClient}>
        <HeroUIProvider>
          <AppShell>
            <Component {...pageProps} />
          </AppShell>
        </HeroUIProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default MyApp;
