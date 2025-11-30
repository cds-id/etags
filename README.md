# Etags

**Platform Penandaan Produk & Stamping Blockchain**

Aplikasi untuk mengelola brand, produk, dan tag dengan pelacakan transaksi blockchain untuk tujuan autentikasi dan verifikasi keaslian produk.

## Demo

🔗 **Live Demo:** https://internal-etags.gqp4pd.easypanel.host/

## Repository

📦 **GitHub:** https://github.com/cds-id/etags

## Hackathon

🏆 **IMPHEN 2025**

## Tim

**Pemuja Deadline Anti Refund**

[![igun997](https://img.shields.io/badge/GitHub-igun997-181717?style=for-the-badge&logo=github)](https://github.com/igun997)
[![inact25](https://img.shields.io/badge/GitHub-inact25-181717?style=for-the-badge&logo=github)](https://github.com/inact25)
[![juanaf31](https://img.shields.io/badge/GitHub-juanaf31-181717?style=for-the-badge&logo=github)](https://github.com/juanaf31)
[![ramaramx](https://img.shields.io/badge/GitHub-ramaramx-181717?style=for-the-badge&logo=github)](https://github.com/ramaramx)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** MySQL + Prisma ORM
- **Authentication:** NextAuth v5
- **Blockchain:** ethers.js
- **Storage:** Cloudflare R2
- **Styling:** Tailwind CSS v4

## Fitur Utama

- **Manajemen Brand** - Kelola informasi brand/merek produk
- **Manajemen Produk** - Katalog produk dengan metadata dinamis (JSON)
- **Manajemen Tag** - Buat dan kelola tag untuk produk
- **Blockchain Stamping** - Catat tag ke blockchain untuk verifikasi keaslian
- **Pelacakan Status** - Lacak siklus hidup tag (Created → Distributed → Claimed → Transferred)
- **Upload File** - Simpan gambar dan file ke Cloudflare R2
- **API Documentation** - Swagger UI untuk dokumentasi API

## Cara Penggunaan

### 1. Instalasi

```bash
# Clone repository
git clone https://github.com/cds-id/etags.git
cd etags

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 2. Konfigurasi Environment

Edit file `.env` dengan konfigurasi Anda:

```env
# Database MySQL
DATABASE_URL="mysql://username:password@localhost:3306/etags"

# NextAuth (generate dengan: openssl rand -base64 32)
AUTH_SECRET="your_secret_here"
AUTH_TRUST_HOST=true  # Wajib untuk production/deployment

# Cloudflare R2 (opsional, untuk upload file)
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_access_key"
R2_SECRET_ACCESS_KEY="your_secret_key"
R2_BUCKET="your_bucket"

# Blockchain (opsional, untuk stamping)
BLOCKCHAIN_RPC_URL="https://rpc.example.com"
CONTRACT_ADDRESS="0x..."
CHAIN_ID="1"
ADMIN_WALLET="your_private_key"
```

### 3. Setup Database

```bash
# Push schema ke database
npm run db:push

# Buat akun admin
npm run db:create-admin

# Atau dengan kredensial custom
npm run db:create-admin -- email@anda.com password123 "Nama Anda"
```

### 4. Jalankan Aplikasi

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### 5. Akses Aplikasi

| Halaman      | URL       | Keterangan                    |
| ------------ | --------- | ----------------------------- |
| Landing Page | `/`       | Halaman utama publik          |
| Login        | `/login`  | Halaman login admin           |
| Dashboard    | `/manage` | Dashboard admin (perlu login) |
| API Docs     | `/docs`   | Dokumentasi Swagger UI        |

### 6. Login Default

```
Email: admin@example.com
Password: admin123
```

## Siklus Hidup Tag (Blockchain)

```
CREATED (0)      → Tag dibuat di blockchain
    ↓
DISTRIBUTED (1)  → Tag didistribusikan ke produk
    ↓
CLAIMED (2)      → Tag diklaim oleh end user
    ↓
TRANSFERRED (3)  → Kepemilikan ditransfer
    ↓
FLAGGED (4)      → Tag ditandai untuk review
    ↓
REVOKED (5)      → Tag dicabut/dibatalkan
```

## Scripts

| Command                   | Keterangan                  |
| ------------------------- | --------------------------- |
| `npm run dev`             | Jalankan development server |
| `npm run build`           | Build untuk production      |
| `npm run lint`            | Jalankan ESLint             |
| `npm run typecheck`       | Cek TypeScript types        |
| `npm run format`          | Format kode dengan Prettier |
| `npm run db:push`         | Push schema ke database     |
| `npm run db:studio`       | Buka Prisma Studio GUI      |
| `npm run db:create-admin` | Buat akun admin             |

## Lisensi

MIT License
