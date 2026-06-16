# Backend — TOEFL Certificate Verification

Backend API untuk sistem verifikasi sertifikat TOEFL berbasis blockchain. Mengelola autentikasi, pendaftaran peserta, penjadwalan tes, penilaian, dan verifikasi sertifikat melalui IPFS dan Ethereum smart contract.

## Tech Stack

- **Runtime**: Node.js 22
- **Framework**: Express 5
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Storage**: Cloudinary (bukti pembayaran), Pinata/IPFS (data sertifikat)
- **Blockchain**: Ethers.js (interaksi smart contract)
- **Auth**: JWT (JSON Web Token)

## Modules

| Module       | Base Path          | Description                                 |
| ------------ | ------------------ | ------------------------------------------- |
| Auth         | `/api/auth`        | Register, login, dan profil user            |
| Service      | `/api/services`    | CRUD layanan tes TOEFL                      |
| Schedule     | `/api/schedules`   | Manajemen jadwal tes                        |
| Enrollment   | `/api/enrollments` | Pendaftaran peserta, approval, submit score |
| User         | `/api/users`       | Fitur khusus peserta (aktivitas)            |
| Verification | `/api/verify`      | Verifikasi sertifikat via CID               |

## Setup

### Prerequisites

- Node.js ≥ 22
- pnpm
- MongoDB

### Install Dependencies

```bash
pnpm install
```

### Environment Variables

```bash
cp .env
```

Isi `.env` dengan konfigurasi yang sesuai. Lihat `.env.example` untuk daftar lengkap variabel.

| Variable                | Required | Description                          |
| ----------------------- | -------- | ------------------------------------ |
| `PORT`                  | ✅       | Port server (default: 3005)          |
| `NODE_ENV`              |          | Environment (development/production) |
| `DATABASE_URL`          | ✅       | MongoDB connection string            |
| `JWT_SECRET`            | ✅       | Secret key untuk JWT                 |
| `ADMIN_TOKEN`           | ✅       | Token untuk registrasi admin         |
| `PINATA_JWT`            | ✅       | Pinata API JWT token                 |
| `PINATA_URL`            |          | Pinata API URL                       |
| `PINATA_API_SECRET`     |          | Pinata API secret                    |
| `PINATA_GROUP_PRIVATE`  |          | Pinata group ID                      |
| `PINATA_GATEAWAY`       |          | Pinata gateway domain                |
| `CLOUDINARY_CLOUD_NAME` |          | Cloudinary cloud name                |
| `CLOUDINARY_API_KEY`    |          | Cloudinary API key                   |
| `CLOUDINARY_API_SECRET` |          | Cloudinary API secret                |

## Usage

### Development

```bash
pnpm dev
```

Server berjalan di `http://localhost:3005/api`

### Production Build

```bash
pnpm build
pnpm start
```

### Docker

```bash
docker build -t backend .
docker run -p 3005:3005 --env-file .env backend
```

### Health Check

```
GET /api/check-health
```

Mengecek koneksi ke Database, Pinata, dan Cloudinary.

## API Documentation

Dokumentasi API interaktif (Swagger UI) tersedia saat server berjalan di:

```
http://localhost:3005/api-docs
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Entry point (Express server)
│   ├── config/
│   │   ├── db.ts                # Koneksi MongoDB
│   │   ├── env.ts               # Variabel lingkungan (Environment variables)
│   │   ├── cloudinary.ts        # Konfigurasi Cloudinary
│   │   └── pinata.ts            # Konfigurasi Pinata/IPFS
│   ├── common/
│   │   ├── middlewares/         # Auth, error, role, & upload middleware
│   │   ├── dtos/                # Data transfer objects (validasi input)
│   │   └── utils/               # Helper utilities (JWT, response format, healthCheck)
│   ├── docs/
│   │   └── swagger.json         # Dokumentasi API statis (OpenAPI 3.0)
│   └── modules/
│       ├── auth/                # Autentikasi & Profile
│       ├── service/             # Layanan TOEFL
│       ├── schedule/            # Penjadwalan tes
│       ├── enrollment/          # Pendaftaran, approval, & input nilai
│       ├── user/                # Riwayat aktivitas peserta
│       ├── testing/             # Modul pengujian (AE)
│       └── verification/        # Verifikasi sertifikat TOEFL
├── Dockerfile
├── .dockerignore
├── .env
└── package.json
```
