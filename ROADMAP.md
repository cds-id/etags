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
- [x] Role-based Access - Admin dan Brand user roles
- [x] File Storage - Upload ke Cloudflare R2
- [x] API Documentation - Swagger UI

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
- Cloudflare R2
- Kolosal AI (Analytics & Fraud Detection)

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

## 🔮 Future Considerations

Fitur yang mungkin dikembangkan setelah Phase 4:

### NFT Integration

- Tag sebagai NFT untuk collectibles
- Secondary market untuk produk limited edition
- Royalty tracking untuk resale

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

---

## Contributing

Tertarik berkontribusi? Lihat [CONTRIBUTING.md](./CONTRIBUTING.md) untuk panduan.

## Feedback

Punya ide atau feedback untuk roadmap ini? Buat issue di [GitHub](https://github.com/cds-id/etags/issues).
