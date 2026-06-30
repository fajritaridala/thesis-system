import { ethers } from 'ethers';
import { switchChain } from '@wagmi/core';
import { config } from '@/lib/wagmi/config';
import ToeflRecordABI from '@/abi/ToeflRecord.json';
import { CONTRACT_ADDRESS, RPC_URL } from '@/utils/config/env';

// Conditional logger - only logs in development
const isDev = process.env.NODE_ENV === 'development';
const log = (...args: unknown[]) => isDev && console.log(...args);

interface StoreToBlockchainParams {
  hash: string;
  cid: string;
}

interface StoreToBlockchainResult {
  transactionHash: string;
  blockNumber: number;
  success: boolean;
}

/**
 * Timeout wrapper for promises
 */
const withTimeout = <T>(
  promise: Promise<T>,
  ms: number,
  message: string
): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(message)), ms)
  );
  return Promise.race([promise, timeout]);
};

/**
 * Store certificate data to blockchain
 * @param hash - Hash from backend (hash of CID + crypto address)
 * @param cid - IPFS CID from Pinata
 * @returns Transaction details
 */
export async function storeToBlockchain({
  hash,
  cid,
}: StoreToBlockchainParams): Promise<StoreToBlockchainResult> {
  try {
    log('🔗 Starting blockchain transaction...');
    log('Hash:', hash);
    log('CID:', cid);

    // 1. Check contract address
    if (!CONTRACT_ADDRESS) {
      throw new Error('Contract address not configured');
    }

    log('Contract Address:', CONTRACT_ADDRESS);

    // 2. Dynamic import MetaMask (only loaded when this function is called)
    const { default: metamask } = await import('@/lib/metamask/metamask');

    // 3. Connect MetaMask and get signer
    const { signer } = await metamask.connectAndSign();

    // 4. Validasi & Paksa Switch ke Jaringan Sepolia (Chain ID: 11155111)
    const network = await signer.provider.getNetwork();
    if (network.chainId !== 11155111n) {
      log('⚠️ Wallet not on Sepolia. Requesting switch...');
      try {
        await switchChain(config, { chainId: 11155111 });
      } catch {
        throw new Error('Harap alihkan jaringan MetaMask Anda ke Sepolia Testnet');
      }
    }

    const address = await signer.getAddress();
    log('Connected wallet:', address);

    // 5. Create contract instance
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ToeflRecordABI.abi,
      signer
    );

    // 6. Convert hash string to bytes32
    const hashBytes32 = hash.startsWith('0x') ? hash : `0x${hash}`;
    log('Hash (bytes32):', hashBytes32);

    // 7. Call store function with timeout (2 minutes)
    log('📝 Calling contract.store()...');
    const tx = await withTimeout(
      contract.store(hashBytes32, cid),
      120000, // 2 minutes
      'Transaksi timeout. Silakan cek MetaMask dan coba lagi.'
    );
    log('Transaction sent:', tx.hash);

    // 8. Wait for confirmation (1 confirmation for Sepolia devnet is fast and safe enough)
    const confirmations = 1;
    log(`⏳ Waiting for ${confirmations} confirmation(s)...`);
    const receipt = await tx.wait(confirmations);
    log('✅ Transaction confirmed!');
    log('Block number:', receipt.blockNumber);
    log('Transaction hash:', receipt.hash);

    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      success: true,
    };
  } catch (error) {
    const err = error as Error;
    if (isDev) {
      console.error('❌ Blockchain transaction failed:', err);
    }

    // Handle specific errors with user-friendly messages
    if (err.message.includes('user rejected')) {
      throw new Error('Transaksi ditolak oleh user');
    } else if (err.message.includes('insufficient funds')) {
      throw new Error('Saldo tidak cukup untuk membayar gas fee');
    } else if (
      err.message.includes('already exists') ||
      err.message.includes('Record already exists')
    ) {
      throw new Error('Sertifikat sudah tersimpan di blockchain');
    } else if (err.message.includes('Contract address')) {
      throw new Error('Konfigurasi contract address tidak valid');
    } else if (err.message.includes('timeout')) {
      throw new Error(err.message);
    } else {
      throw new Error(`Blockchain error: ${err.message}`);
    }
  }
}

/**
 * Get record from blockchain by hash
 * @param hash - Certificate hash
 * @returns IPFS CID
 */
export async function getRecordFromBlockchain(hash: string): Promise<string> {
  try {
    if (!CONTRACT_ADDRESS) {
      throw new Error('Contract address not configured');
    }

    // Daftar RPC Sepolia cadangan apabila RPC utama bermasalah
    const rpcs = [
      RPC_URL,
      'https://ethereum-sepolia-rpc.publicnode.com',
      'https://rpc.ankr.com/eth_sepolia',
      'https://sepolia.gateway.tenderly.co',
    ].filter(Boolean);

    let provider: ethers.JsonRpcProvider | null = null;
    let lastError: Error | null = null;

    for (const url of rpcs) {
      try {
        log(`Trying RPC: ${url}`);
        const tempProvider = new ethers.JsonRpcProvider(url);
        // Test koneksi ringan
        await tempProvider.getBlockNumber();
        provider = tempProvider;
        break; // Berhasil terhubung, keluar loop
      } catch (err) {
        lastError = err as Error;
        log(`RPC ${url} failed:`, lastError.message);
      }
    }

    if (!provider) {
      throw new Error(`Gagal terhubung ke semua provider RPC Sepolia. Error terakhir: ${lastError?.message}`);
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ToeflRecordABI.abi,
      provider
    );

    const cid = await contract.getRecord(hash);

    if (!cid || cid === '') {
      throw new Error('Sertifikat belum tercatat di Blockchain');
    }

    return cid;
  } catch (error) {
    const err = error as Error;
    throw new Error(`Gagal memuat sertifikat dari blockchain: ${err.message}`);
  }
}
