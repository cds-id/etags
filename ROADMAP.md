# Etags Roadmap

Dokumen ini menjelaskan rencana pengembangan Etags dari MVP hingga fitur-fitur lanjutan.

---

## ✅ Phase 1: MVP (Current)

**Status: Complete**

Fitur dasar untuk penandaan produk dan verifikasi blockchain.

### Features

- [x] Manajemen Brand - CRUD operasi untuk brand/merek
- [x] Manajemen Produk - Katalog produk dengan metadata dinamis (JSON)
- [x] Manajemen Tag - Generate dan kelola tag untuk produk
- [x] QR Code Generation - QR code dengan template design
- [x] Blockchain Stamping - Catat tag ke blockchain (Base Sepolia)
- [x] Tag Verification - Scan QR dan verifikasi keaslian produk
- [x] Tag Lifecycle - Status tracking (Created → Distributed → Claimed → Transferred → Revoked)
- [x] AI Agent Dashboard - Asisten AI untuk analisis data (tersedia untuk Admin & Brand)
- [x] AI Fraud Detection - Deteksi fraud menggunakan Kolosal AI
- [x] NFT Collectible - NFT untuk first-hand owner dengan AI-generated artwork (Gemini)
- [x] Role-based Access - Admin dan Brand user roles
- [x] File Storage - Upload ke Cloudflare R2
- [x] API Documentation - Swagger UI

### NFT Collectible Flow

First-hand owner dapat mint NFT sebagai bukti kepemilikan digital:

```
1. User scan QR code tag → Verifikasi produk
2. User claim sebagai first-hand owner
3. Connect wallet (MetaMask/Web3)
4. AI generate artwork unik (Gemini)
5. NFT di-mint ke blockchain (gas-free)
6. NFT dikirim ke wallet user
```

**Fitur NFT:**

- AI-Generated Artwork - Setiap NFT memiliki artwork unik dari Gemini AI
- Gas-Free Minting - User tidak bayar gas fee, platform yang menanggung
- On-Chain Proof - NFT disimpan di Base Sepolia sebagai bukti kepemilikan
- One-Per-Tag - Setiap tag hanya bisa mint satu NFT (enforced by smart contract)
- Admin Monitoring - Dashboard untuk monitoring semua NFT yang di-mint

### AI Agent Capabilities

AI Agent terintegrasi di dashboard untuk membantu pengguna menganalisis data:

**Untuk Admin:**

- Analisis statistik keseluruhan platform
- Identifikasi tren dan pola penggunaan
- Deteksi anomali dan potensi fraud
- Rekomendasi optimasi bisnis

**Untuk Brand User:**

- Analisis performa produk dan tag
- Insight distribusi geografis
- Pemahaman perilaku konsumen
- Alert untuk aktivitas mencurigakan

### Tech Stack

- Next.js 16 + React 19
- MySQL + Prisma ORM
- NextAuth v5 (Credentials)
- ethers.js + Base Sepolia
- ERC721 NFT (ETagCollectible contract)
- Cloudflare R2
- Kolosal AI (Analytics & Fraud Detection)
- Gemini AI (NFT Art Generation)

---

## 🚀 Phase 2: Wallet Authentication

**Status: Planned**

Brand user dapat menggunakan crypto wallet untuk authentication dan multi-signature stamping.

### Features

#### 2.1 Wallet Login untuk Brand

- [ ] Integrasi WalletConnect / RainbowKit
- [ ] Support MetaMask, Coinbase Wallet, dan wallet populer lainnya
- [ ] Wallet address linking ke existing brand account
- [ ] Hybrid auth: user bisa pilih login via wallet atau credentials
- [ ] Wallet signature verification untuk authentication

#### 2.2 Multi-signature Stamping

- [ ] Tag stamping memerlukan 2 signature: Platform + Brand
- [ ] Brand harus approve sebelum tag di-stamp ke blockchain
- [ ] Pending approval queue di dashboard brand
- [ ] Notification system untuk approval requests
- [ ] Audit trail untuk semua approval/rejection

#### 2.3 Smart Contract Updates

- [ ] Upgrade ETagRegistry contract untuk multi-sig support
- [ ] Add brand wallet address ke Tag struct on-chain
- [ ] Event logging untuk approval process

---

## 📦 Phase 3: Distribution Tracking

**Status: Planned**

Brand dapat melacak pergerakan produk sepanjang supply chain, bahkan setelah penjualan.

### Features

#### 3.1 Post-sales Tracking

- [ ] Tracking ownership chain dari distributor ke end user
- [ ] Location history untuk setiap tag
- [ ] Scan history dengan geolocation data
- [ ] Transfer ownership dengan verification

#### 3.2 Supply Chain Visibility

- [ ] Distributor registration dan verification
- [ ] Checkpoint scanning di setiap titik distribusi
- [ ] Real-time location updates
- [ ] Expected vs actual route comparison

#### 3.3 Analytics Dashboard

- [ ] Distribution heatmap
- [ ] Time-to-market analytics
- [ ] Regional distribution reports
- [ ] Anomaly detection (unexpected locations)

#### 3.4 Alerts & Notifications

- [ ] Alert jika produk muncul di lokasi tidak terduga
- [ ] Notification saat ownership transfer
- [ ] Weekly/monthly distribution reports

## 🛡️ Phase 4: Blockchain Warranty

**Status: Planned**

Sistem garansi yang terintegrasi dengan blockchain - user harus claim produk untuk mendapatkan garansi.

### Features

#### 4.1 Claim-based Warranty

- [ ] User harus claim tag sebelum garansi aktif
- [ ] Claim process dengan wallet signature
- [ ] Warranty activation date = claim date
- [ ] Claim verification via blockchain

#### 4.2 On-chain Warranty Data

- [ ] Warranty terms stored on-chain
- [ ] Warranty period tracking
- [ ] Warranty status queries via smart contract
- [ ] Immutable warranty records

#### 4.3 Warranty Transfer

- [ ] Warranty bisa transfer saat produk dijual kembali
- [ ] Transfer memerlukan signature dari current owner
- [ ] Warranty history tracking
- [ ] Remaining warranty period calculation

#### 4.4 Warranty Claims

- [ ] Submit warranty claim dengan evidence
- [ ] Brand review dan approval process
- [ ] Claim status tracking
- [ ] Integration dengan service centers

### User Flow

```
1. User scan QR code produk
2. Verifikasi keaslian via blockchain
3. User claim ownership (wallet signature)
4. Warranty otomatis aktif dengan periode dari brand
5. Jika jual produk → transfer warranty ke buyer baru
6. Jika ada masalah → submit warranty claim
7. Brand review → approve/reject
8. Service center handling (jika approved)
```

---

## ✅ Phase 5: Web3 Support Ticket

**Status: Complete**

Sistem support ticket berbasis Web3 untuk pemilik NFT - memungkinkan first-hand owner untuk mengajukan komplain langsung ke brand.

### Features

#### 5.1 Web3 Authentication untuk Support

- [x] Auto-login dengan wallet (MetaMask/WalletConnect)
- [x] Deteksi otomatis NFT yang dimiliki user dari wallet address
- [x] Verifikasi kepemilikan dari database
- [x] Wallet connection untuk session

#### 5.2 Product Selection & Ticket Creation

- [x] Tampilkan daftar produk yang dimiliki (dari NFT ownership)
- [x] User pilih produk yang ingin dikomplain
- [x] Form komplain dengan kategori (Defect, Missing Parts, Quality Issue, dll)
- [x] Rich text description untuk detail masalah

#### 5.3 Ticket Routing

- [x] Ticket otomatis dikirim ke brand dashboard
- [x] Jika brand tidak punya user aktif → fallback ke admin platform
- [x] Assignment system untuk brand team

#### 5.4 Brand Dashboard - Ticket Management

- [x] List semua ticket untuk brand
- [x] Filter by status (Open, In Progress, Resolved, Closed)
- [x] Reply system
- [x] Ticket status updates

#### 5.5 Customer Support Portal

- [x] Halaman `/support` untuk NFT holders
- [x] Track ticket status real-time
- [x] Conversation history dengan brand

#### 5.6 Admin Platform Oversight

- [x] Admin bisa lihat semua tickets across brands
- [x] Take over ticket jika brand tidak responsif

### User Flow

```
1. User buka /support
2. Connect wallet (MetaMask/Web3)
3. System detect NFTs owned by wallet
4. User pilih produk yang bermasalah
5. Isi form komplain + upload bukti
6. Submit ticket → dikirim ke brand
7. Brand reply di dashboard
8. User dapat notification & bisa reply
9. Ticket resolved
```

### Fallback Flow (No Brand User)

```
1. Ticket masuk ke brand
2. Tidak ada brand user aktif
3. System assign ke admin platform
4. Admin handle atau assign ke brand
```

### Database Schema

- **SupportTicket** - Ticket dengan status, priority, brand_id, tag_id
- **TicketMessage** - Conversation thread (user & brand replies)
- **TicketAttachment** - File attachments (images, videos)

---

## 🔮 Future Considerations

Fitur yang mungkin dikembangkan setelah Phase 5:

### NFT Marketplace Integration

- Secondary market untuk produk limited edition
- Royalty tracking untuk resale
- NFT trading/transfer antar user

### Cross-chain Support

- Support multiple blockchains
- Bridge untuk cross-chain verification
- Chain-agnostic tag verification

### Marketplace Integration

- Integration dengan e-commerce platforms
- Automatic verification saat checkout
- Seller verification system

---

## Timeline Overview

| Phase   | Description           | Status  |
| ------- | --------------------- | ------- |
| Phase 1 | MVP                   | ✅ Done |
| Phase 2 | Wallet Authentication | Planned |
| Phase 3 | Distribution Tracking | Planned |
| Phase 4 | Blockchain Warranty   | Planned |
| Phase 5 | Web3 Support Ticket   | ✅ Done |

---

## Contributing

Tertarik berkontribusi? Lihat [CONTRIBUTING.md](./CONTRIBUTING.md) untuk panduan.

## Feedback

Punya ide atau feedback untuk roadmap ini? Buat issue di [GitHub](https://github.com/cds-id/etags/issues).
