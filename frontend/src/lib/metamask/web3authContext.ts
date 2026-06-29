import { WEB3AUTH_NETWORK } from '@web3auth/modal';
import type { Web3AuthContextConfig } from '@web3auth/modal/react';
import { WEB3AUTH_CLIENT_ID } from '@/utils/config/env';

const clientId = WEB3AUTH_CLIENT_ID;
console.log(clientId)

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // development network
  },
};

export default web3AuthContextConfig;
