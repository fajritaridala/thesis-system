declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SEPOLIA_RPC_URL: string;
      SEPOLIA_PRIVATE_KEY: string;
    }
  }
}

export {};
