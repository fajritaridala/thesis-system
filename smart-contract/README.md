# TOEFLRecord Smart Contract

Smart contract untuk menyimpan dan memverifikasi sertifikat TOEFL di blockchain Ethereum. Data sertifikat disimpan di IPFS, sedangkan hash dan CID-nya dicatat on-chain untuk menjamin integritas dan keaslian data.

## Deployed Contract

| Network         | Address                                      | Explorer                                                                                     |
| --------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Sepolia Testnet | `0xF14BFc5C766F174316149c37eb5c8c865232fa81` | [Etherscan](https://sepolia.etherscan.io/address/0xF14BFc5C766F174316149c37eb5c8c865232fa81) |

## Tech Stack

- **Solidity** 0.8.28
- **Hardhat** 3
- **OpenZeppelin** Contracts (Ownable)
- **Ethers.js** v6
- **Mocha** + **Chai** (testing)

## Contract Overview

### Functions

| Function                          | Access     | Description                        |
| --------------------------------- | ---------- | ---------------------------------- |
| `store(bytes32 hash, string cid)` | Owner only | Menyimpan record baru (hash → CID) |
| `getRecord(bytes32 hash)`         | Public     | Mengambil CID dari hash            |
| `exists(bytes32 hash)`            | Public     | Mengecek apakah record sudah ada   |
| `transferOwnership(address)`      | Owner only | Transfer kepemilikan contract      |

### Events

| Event          | Parameters                                                     |
| -------------- | -------------------------------------------------------------- |
| `RecordStored` | `address indexed sender`, `bytes32 indexed hash`, `string cid` |

### Errors

| Error                               | Description                            |
| ----------------------------------- | -------------------------------------- |
| `RecordAlreadyExists(bytes32 hash)` | Revert jika hash sudah pernah disimpan |

## Setup

### Prerequisites

- Node.js ≥ 22
- pnpm

### Install Dependencies

```bash
pnpm install
```

### Environment Variables

```bash
cp .env
```

Isi `.env` dengan:

```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
SEPOLIA_PRIVATE_KEY=your_private_key
```

## Usage

```bash
# Compile contract
pnpm compile

# Run tests
pnpm test

# Deploy ke local network
pnpm deploy

# Deploy ke Sepolia
pnpm deploy:sepolia
```

## Project Structure

```
smart-contract/
├── contracts/
│   └── TOEFLRecord.sol        # Smart contract utama
├── ignition/
│   └── modules/
│       └── TOEFLRecord.ts     # Ignition deployment module
├── scripts/
│   └── deploy.ts              # Deploy script
├── test/
│   └── TOEFLRecord.test.ts    # Unit tests (14 test cases)
├── .env.example               # Template environment variables
└── hardhat.config.ts          # Hardhat configuration
```
