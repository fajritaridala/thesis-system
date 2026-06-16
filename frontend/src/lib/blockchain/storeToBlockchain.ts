import { ethers } from 'ethers';
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
    const address = await signer.getAddress();
    log('Connected wallet:', address);

    // 3. Create contract instance
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ToeflRecordABI.abi,
      signer
    );

    // 4. Convert hash string to bytes32
    // Backend should send hash as hex string (0x...)
    const hashBytes32 = hash.startsWith('0x') ? hash : `0x${hash}`;
    log('Hash (bytes32):', hashBytes32);

    // 5. Call store function with timeout (2 minutes)
    // Contract handles duplicate check internally with require statement
    log('📝 Calling contract.store()...');
    const tx = await withTimeout(
      contract.store(hashBytes32, cid),
      120000, // 2 minutes
      'Transaksi timeout. Silakan cek MetaMask dan coba lagi.'
    );
    log('Transaction sent:', tx.hash);

    // 6. Wait for confirmation
    // Use 1 confirmation for dev (faster), 2 for production (more secure)
    const confirmations = isDev ? 1 : 2;
    log(`⏳ Waiting for ${confirmations} confirmation(s)...`);
    const receipt = await tx.wait(confirmations);
    log('✅ Transaction confirmed!');
    log('Block number:', receipt.blockNumber);
    log('Transaction hash:', receipt.hash);

    // Transaction confirmed = data stored successfully
    // No need to verify with getRecord - tx.wait already guarantees this

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
      throw new Error(err.message); // Pass through timeout message
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

    // Use JsonRpcProvider for read-only access (no MetaMask needed)
    if (!RPC_URL) {
      throw new Error('RPC_URL tidak ditemukan');
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
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
    throw new Error(`Failed to get record: ${err.message}`);
  }
}
