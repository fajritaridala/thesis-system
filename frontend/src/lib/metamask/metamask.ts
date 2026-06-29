import { connect, disconnect, getAccount, getConnectorClient } from '@wagmi/core';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { config } from '../wagmi/config';

// Helper to convert viem client to ethers signer
async function getEthersSigner(chainId?: number) {
  const client = await getConnectorClient(config, {
    chainId: chainId as 11155111 | undefined,
  });
  const { account, chain, transport } = client;
  const targetChain = chain || config.chains[0];
  const network = {
    chainId: targetChain.id,
    name: targetChain.name,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = new JsonRpcSigner(provider, account.address);
  return signer;
}

// Helper to convert viem client to ethers provider
async function getEthersProvider(chainId?: number) {
  const client = await getConnectorClient(config, {
    chainId: chainId as 11155111 | undefined,
  });
  const { chain, transport } = client;
  const targetChain = chain || config.chains[0];
  const network = {
    chainId: targetChain.id,
    name: targetChain.name,
  };
  return new BrowserProvider(transport, network);
}

const metamask = {
  /**
   * Connect to MetaMask and get account address
   */
  async connect() {
    try {
      const connector = config.connectors.find(
        (c) =>
          c.name.toLowerCase().includes('metamask') ||
          c.id === 'metaMaskSDK' ||
          c.id === 'io.metamask'
      );
      if (!connector) throw new Error('MetaMask tidak ditemukan');

      const result = await connect(config, { connector });
      const address = result.accounts[0];
      return { address };
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || 'Gagal menghubungkan MetaMask');
    }
  },

  /**
   * Connect, sign a message, and return signer + provider
   * Used for transactions that require signing
   */
  async connectAndSign() {
    try {
      const connector = config.connectors.find(
        (c) =>
          c.name.toLowerCase().includes('metamask') ||
          c.id === 'metaMaskSDK' ||
          c.id === 'io.metamask'
      );
      if (!connector) throw new Error('MetaMask tidak ditemukan');

      const account = getAccount(config);
      if (!account.isConnected) {
        await connect(config, { connector });
      }

      const signer = await getEthersSigner();
      
      // Prompt user to sign confirmation message
      await signer.signMessage('konfirmasi input data');

      const provider = await getEthersProvider();

      return { signer, provider };
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || 'Gagal melakukan tanda tangan');
    }
  },

  /**
   * Force disconnect and reconnect - use when user wants to switch wallet
   */
  async switchWallet() {
    try {
      const connector = config.connectors.find(
        (c) =>
          c.name.toLowerCase().includes('metamask') ||
          c.id === 'metaMaskSDK' ||
          c.id === 'io.metamask'
      );
      if (!connector) throw new Error('MetaMask tidak ditemukan');

      // Revoke permissions directly via the provider if possible to force MetaMask account picker
      const provider = (await connector.getProvider()) as {
        request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      } | undefined;
      if (provider && typeof provider.request === 'function') {
        try {
          await provider.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }],
          });
        } catch {
          // ignore rejection
        }
      }

      // Disconnect first to reset Wagmi state
      try {
        await disconnect(config);
      } catch {
        // ignore
      }

      // Reconnect
      const result = await connect(config, { connector });
      const address = result.accounts[0];
      return { address };
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || 'Gagal mengganti akun MetaMask');
    }
  },
};

export default metamask;
