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

---

## 📝 About This Project

This project is created for educational and academic research purposes as part of an undergraduate thesis (*skripsi*). It demonstrates how decentralized networks and cryptography can be integrated into academic credentials to establish trust and prevent document tampering.
