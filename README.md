# Web3 TOEFL Record Verification System

A decentralized, tamper-proof system designed to store, manage, and verify TOEFL certificate validity using blockchain technology (EVM-compatible networks) and IPFS. This repository forms the codebase for an undergraduate thesis (*skripsi*) project aimed at solving certificate forgery through cryptographic verification.

---

## 🚀 Key Features

* **Decentralized Verification**: Logs cryptographic hashes of TOEFL certificates directly onto the blockchain, mapping them to secure IPFS metadata.
* **IPFS Decentralized Storage**: Stores certificate files and metadata on the IPFS network via Pinata to ensure high availability and permanence.
* **Interactive Frontend**: A modern Next.js dashboard featuring certificate uploading, verification, and visual record management.
* **Instant QR Verification**: Generates unique QR codes for each certificate, allowing instant verification via any QR reader or the portal web camera.
* **Robust Express API**: Manages user authentication, PDF extraction/parsing, database persistence, and communication with IPFS and Cloudinary.

---

## 📁 Repository Structure

The project is structured as a monorepo containing three core packages:

```
web3-skripsi/
├── compose.yaml              # Production Docker Compose
├── compose.dev.yaml           # Development Docker Compose
├── frontend/
│   ├── Dockerfile             # Multi-stage build (development + runner)
│   ├── .dockerignore
│   ├── .env.development       # Dev environment variables (gitignored)
│   ├── .env.production        # Prod environment variables (gitignored)
│   └── src/
├── backend/
│   ├── Dockerfile             # Multi-stage build (development + runner)
│   ├── .dockerignore
│   ├── .env.development       # Dev environment variables (gitignored)
│   ├── .env.production        # Prod environment variables (gitignored)
│   └── src/
└── smart-contract/
    └── contracts/
```

### 1. [smart-contract]
Manages the decentralized ledger logic using Solidity.
* **Core Contract**: `TOEFLRecord.sol` – maps certificate hashes to IPFS CIDs.
* **Framework**: Hardhat with TypeScript.
* **Key Tasks**: Deploying, testing, and compiling smart contracts for EVM-compatible networks.

### 2. [backend]
An Express API server serving as the bridge between the frontend, database, and decentralized services.
* **Language**: TypeScript (Node.js).
* **Database**: MongoDB (Mongoose ORM).
* **Integrations**: Pinata (IPFS pinning), Cloudinary (asset storage), and Ethers.js (smart contract queries).
* **Features**: Authentication (JWT), file upload handler (Multer), API documentation (Swagger).

### 3. [frontend]
A highly responsive Web3 client interface.
* **Framework**: Next.js 15, React 19, TailwindCSS v4, and HeroUI (formerly NextUI).
* **Web3 Integration**: MetaMask SDK and Ethers.js.
* **Features**: Drag-and-drop verification portal, interactive dashboards, PDF rendering, and QR scanner.

---

## 🛠️ Technology Stack

| Component | Technologies |
| :--- | :--- |
| **Blockchain** | Solidity, Hardhat, Ethers.js, MetaMask SDK |
| **Frontend** | Next.js 15, React 19, TailwindCSS v4, HeroUI, TanStack Query, Framer Motion |
| **Backend** | Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, Multer |
| **Cloud/IPFS** | Pinata (IPFS), Cloudinary |
| **DevOps** | Docker, Docker Compose, pnpm, multi-stage builds |

---

## ⚙️ Prerequisites

Before running this project, ensure you have the following installed:

| Tool | Version | Required For |
| :--- | :--- | :--- |
| **Docker** | ≥ 24.x | Containerization |
| **Docker Compose** | ≥ 2.20 (plugin) | Multi-container orchestration |
| **Node.js** | 24.x (Alpine) | Runtime (handled by Docker) |
| **pnpm** | 11.3.0 | Package manager (handled by Docker) |
| **MetaMask** | Latest | Browser wallet for Web3 interaction |

> **Note**: Node.js and pnpm are automatically installed inside Docker containers. You only need Docker and Docker Compose on your host machine.

---

## 🐳 Getting Started with Docker

This project uses multi-stage Docker builds with separate configurations for development and production.

### Environment Setup

Before running, create the required environment files:

```bash
# Backend
cp backend/.env.example backend/.env.development
cp backend/.env.example backend/.env.production
# Edit with your actual values (MongoDB Atlas URI, Pinata JWT, etc.)

# Frontend
cp frontend/.env.example frontend/.env.development
cp frontend/.env.example frontend/.env.production
# Edit with your actual values
```

### Development

```bash
docker compose -f compose.dev.yaml up --build
```

This will:
- Build images using the `development` stage from each Dockerfile
- Bind-mount source code for **hot reload** (changes reflect instantly)
- Frontend available at `http://localhost:3000`
- Backend available at `http://localhost:8080`

To stop:

```bash
docker compose -f compose.dev.yaml down
```

### Production

```bash
docker compose up --build
```

This will:
- Build optimized images using the `runner` stage from each Dockerfile
- Frontend uses Next.js **standalone output** for minimal image size
- Backend runs compiled TypeScript from `dist/`
- Frontend available at `http://localhost:3000`
- Backend available at `http://localhost:8080`

---

## 🏗️ Docker Architecture

Both services use multi-stage Dockerfile builds with pnpm and build cache optimization:

| Stage | Purpose | Used By |
| :--- | :--- | :--- |
| `base` | Node.js + pnpm setup, copy lockfiles | All stages |
| `prod-deps` | Install production dependencies only | `runner` |
| `build` | Install all deps + compile (Next.js build / tsc) | `runner` |
| `runner` | Optimized production image | `compose.yaml` |
| `development` | Dev image with hot reload | `compose.dev.yaml` |

**Key optimizations:**
- **pnpm store cache mount** (`--mount=type=cache`) for faster rebuilds
- **Next.js standalone output** in frontend for ~60-80% smaller production image
- **Explicit Docker network** (`simpeka-network`) for inter-container communication
- **`env_file`** for clean environment variable injection per environment

---

## 📝 About This Project

This project is created for educational and academic research purposes as part of an undergraduate thesis (*skripsi*). It demonstrates how decentralized networks and cryptography can be integrated into academic credentials to establish trust and prevent document tampering.
