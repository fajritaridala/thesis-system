import * as dotenv from 'dotenv';
dotenv.config();

const SEPOLIA_RPC_URL: string = process.env.SEPOLIA_RPC_URL || '';
const SEPOLIA_PRIVATE_KEY: string = process.env.SEPOLIA_PRIVATE_KEY || '';

export { SEPOLIA_RPC_URL, SEPOLIA_PRIVATE_KEY };
