import { http, createConfig } from '@wagmi/core';
import { sepolia } from '@wagmi/core/chains';
import { metaMask } from 'wagmi/connectors';
import { RPC_URL } from '@/utils/config/env';

export const config = createConfig({
  chains: [sepolia],
  ssr: true,
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'TOEFL Verifications',
      },
    }),
  ],
  transports: {
    [sepolia.id]: http(RPC_URL || undefined),
  },
});
