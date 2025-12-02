# Etags

**Platform Penandaan Produk & Stamping Blockchain**

Aplikasi untuk mengelola brand, produk, dan tag dengan pelacakan transaksi blockchain untuk tujuan autentikasi dan verifikasi keaslian produk.

## Demo

🔗 **Live Demo:**
https://tags.cylink.site/

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
- **AI:** Kolosal AI (Analytics & Fraud Detection)
- **Styling:** Tailwind CSS v4

## Fitur Utama

- **Manajemen Brand** - Kelola informasi brand/merek produk
- **Manajemen Produk** - Katalog produk dengan metadata dinamis (JSON)
- **Manajemen Tag** - Buat dan kelola tag untuk produk
- **Blockchain Stamping** - Catat tag ke blockchain untuk verifikasi keaslian
- **Pelacakan Status** - Lacak siklus hidup tag (Created → Distributed → Claimed → Transferred)
- **AI Agent Dashboard** - Asisten AI untuk analisis data dan insights (Admin & Brand)
- **Fraud Detection** - Deteksi kecurangan menggunakan AI pada scan tag
- **Upload File** - Simpan gambar dan file ke Cloudflare R2
- **API Documentation** - Swagger UI untuk dokumentasi API

## AI Agent

Etags dilengkapi dengan **AI Agent** yang tersedia di dashboard untuk membantu admin dan brand user menganalisis data:

### Untuk Admin

- 📊 Analisis statistik keseluruhan platform
- 🔍 Identifikasi tren dan pola penggunaan
- ⚠️ Deteksi anomali dan potensi fraud
- 📈 Rekomendasi optimasi bisnis

### Untuk Brand User

- 📦 Analisis performa produk dan tag
- 🗺️ Insight distribusi geografis
- 👥 Pemahaman perilaku konsumen
- 🚨 Alert untuk aktivitas mencurigakan

### Contoh Pertanyaan ke AI Agent

```
"Berapa total tag yang sudah di-claim bulan ini?"
"Produk mana yang paling banyak di-scan?"
"Apakah ada pola scan yang mencurigakan?"
"Bagaimana distribusi geografis produk saya?"
"Rekomendasikan strategi untuk meningkatkan engagement"
```

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

## Arsitektur Teknis

### Struktur Aplikasi

**Etags** dibangun menggunakan arsitektur modern dengan pemisahan yang jelas antara UI, Business Logic, dan Data Layer:

```
src/
├── app/              # Next.js App Router (UI Layer)
│   ├── api/          # API Routes
│   ├── manage/       # Admin Dashboard
│   └── login/        # Authentication
├── lib/              # Business Logic Layer
│   ├── actions/      # Server Actions
│   ├── services/     # Service Layer
│   └── utils/        # Utility Functions
├── components/       # React Components
│   ├── ui/           # Reusable UI Components (shadcn/ui)
│   └── shared/       # Shared Components
└── types/            # TypeScript Type Definitions
```

### Tech Stack Details

- **Frontend**: Next.js 16 with React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes, Server Actions
- **Database**: MySQL with Prisma ORM (Type-safe queries)
- **Auth**: NextAuth v5 (Credentials Provider)
- **Blockchain**: ethers.js untuk interaksi dengan smart contract
- **Storage**: Cloudflare R2 (S3-compatible)
- **Testing**: Vitest + React Testing Library
- **CI/CD**: GitHub Actions
- **DevOps**: Docker (Multi-stage build untuk production)

### Data Flow

1. **User Interaction** → React Components
2. **Server Actions** → Business Logic di `lib/actions/`
3. **Service Layer** → Database via Prisma atau Blockchain via ethers.js
4. **Response** → UI Update

### Security Features

- ✅ Password hashing dengan bcryptjs
- ✅ Session-based authentication (NextAuth)
- ✅ Environment variables untuk credentials
- ✅ No hardcoded API keys
- ✅ Type-safe database queries (Prisma)

## Docker Deployment

### Build dan Run dengan Docker

```bash
# Build image
docker build -t etags .

# Run container
docker run -p 3000:3000 -e DATABASE_URL="your_db_url" -e AUTH_SECRET="your_secret" etags
```

## Testing

```bash
# Run tests in watch mode
npm run test

# Run tests once (CI mode)
npm run test -- --run

# Run tests dengan coverage
npm run test -- --coverage
```

### Test Coverage

Unit tests tersedia untuk semua server actions di `src/lib/actions/`:

| File          | Coverage |
| ------------- | -------- |
| dashboard.ts  | 100%     |
| auth.ts       | ~95%     |
| onboarding.ts | ~82%     |
| products.ts   | ~81%     |
| users.ts      | ~80%     |
| profile.ts    | ~79%     |
| tags.ts       | ~76%     |
| brands.ts     | ~74%     |
| my-brand.ts   | ~74%     |

## Scripts

| Command                   | Keterangan                  |
| ------------------------- | --------------------------- |
| `npm run dev`             | Jalankan development server |
| `npm run build`           | Build untuk production      |
| `npm run test`            | Run unit tests              |
| `npm run lint`            | Jalankan ESLint             |
| `npm run typecheck`       | Cek TypeScript types        |
| `npm run format`          | Format kode dengan Prettier |
| `npm run db:push`         | Push schema ke database     |
| `npm run db:studio`       | Buka Prisma Studio GUI      |
| `npm run db:create-admin` | Buat akun admin             |

## Roadmap

### ✅ MVP (Current)

- Manajemen Brand, Produk, dan Tag
- Blockchain Stamping untuk verifikasi keaslian
- QR Code scanning dan verifikasi
- AI Agent Dashboard untuk analisis data (Admin & Brand)
- AI-powered fraud detection
- Tag lifecycle tracking (Created → Distributed → Claimed → Transferred)

### 🚀 Phase 2: Wallet Authentication

- **Wallet Login untuk Brand** - Brand user dapat login menggunakan crypto wallet (MetaMask, WalletConnect)
- **Multi-signature Stamping** - Tag stamping memerlukan approval dari platform dan brand user
- Hybrid authentication (wallet + credentials)

### 📦 Phase 3: Distribution Tracking

- **Post-sales Tracking** - Brand dapat melacak distribusi produk setelah penjualan
- Real-time supply chain visibility
- Geolocation tracking untuk pergerakan produk
- Analytics dashboard untuk distribusi

### 🛡️ Phase 4: Blockchain Warranty

- **Claim-based Warranty** - User harus claim produk sebelum mendapatkan garansi
- **On-chain Warranty** - Data garansi terintegrasi dengan blockchain
- Warranty transfer saat produk dijual kembali
- Automated warranty validation

📖 Lihat [ROADMAP.md](./ROADMAP.md) untuk detail lengkap.

## Lisensi

MIT License
