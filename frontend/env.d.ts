declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL: string;
      NEXT_PUBLIC_SECRET: string;
      NEXT_PUBLIC_CONTRACT_ADDRESS: string;
      NEXT_PUBLIC_CERTIFICATE_LINK: string;
      NEXT_PUBLIC_RPC_URL: string;
      NEXT_PUBLIC_IP_PROVIDER: string;
      NEXT_PUBLIC_WEB3AUTH_CLIENT_ID: string;
    }
  }
}
