# Etags

[![Tests](https://github.com/cds-id/etags/actions/workflows/ci.yml/badge.svg)](https://github.com/cds-id/etags/actions/workflows/ci.yml)
[![Deploy - Develop](https://github.com/cds-id/etags/actions/workflows/deploy.yml/badge.svg?branch=develop)](https://github.com/cds-id/etags/actions/workflows/deploy.yml)
[![Deploy - Master](https://github.com/cds-id/etags/actions/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/cds-id/etags/actions/workflows/deploy.yml)

**Product Tagging & Blockchain Stamping Platform** - Manage brands, products, and tags with blockchain transaction tracking for authentication and product verification.

|               |                             |
| ------------- | --------------------------- |
| **Demo**      | https://tags.cylink.site/   |
| **Hackathon** | IMPHEN 2025                 |
| **Team**      | Pemuja Deadline Anti Refund |

[![igun997](https://img.shields.io/badge/GitHub-igun997-181717?style=flat-square&logo=github)](https://github.com/igun997)
[![inact25](https://img.shields.io/badge/GitHub-inact25-181717?style=flat-square&logo=github)](https://github.com/inact25)
[![juanaf31](https://img.shields.io/badge/GitHub-juanaf31-181717?style=flat-square&logo=github)](https://github.com/juanaf31)
[![ramaramx](https://img.shields.io/badge/GitHub-ramaramx-181717?style=flat-square&logo=github)](https://github.com/ramaramx)

<a href="https://github.com/cds-id/etags/graphs/contributors"><img src="https://contrib.rocks/image?repo=cds-id/etags&max=10&columns=5" alt="Contributors" /></a>

## Tech Stack

| Category   | Technology                                        |
| ---------- | ------------------------------------------------- |
| Framework  | Next.js 16 (App Router), React 19, TypeScript     |
| Database   | MySQL + Prisma ORM                                |
| Auth       | NextAuth v5                                       |
| Blockchain | ethers.js, ERC721 NFT (Base Sepolia)              |
| Storage    | Cloudflare R2                                     |
| AI         | Kolosal AI (Fraud Detection), Gemini AI (NFT Art) |
| Styling    | Tailwind CSS v4, shadcn/ui                        |
| Testing    | Vitest                                            |

## Features

### Core

- **Brand/Product/Tag Management** - Full CRUD with metadata support
- **Blockchain Stamping** - Verify authenticity on-chain
- **QR Code Scanning** - Public verification endpoint
- **Tag Lifecycle** - Created → Distributed → Claimed → Transferred → Flagged → Revoked

### AI & NFT

- **NFT Collectible** - Gas-free minting for first-hand owners with AI-generated artwork (Gemini)
- **AI Agent Dashboard** - Data analysis assistant for admin & brands
- **Fraud Detection** - AI-powered scan pattern analysis

### Support

- **Web3 Support Tickets** - NFT holders can submit complaints via wallet connection
- **Auto Product Detection** - System detects owned products from NFT
- **Brand/Admin Routing** - Tickets route to brand, fallback to admin

## Quick Start

```bash
# Clone & install
git clone https://github.com/cds-id/etags.git && cd etags && npm install

# Configure
cp .env.example .env  # Edit with your settings

# Database setup
npm run db:push && npm run db:create-admin

# Run
npm run dev
```

**Default login:** `admin@example.com` / `admin123`

## Environment Variables

```env
# Required
DATABASE_URL="mysql://user:pass@localhost:3306/etags"
AUTH_SECRET="your_secret"  # openssl rand -base64 32

# Optional - R2 Storage
R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET

# Optional - Blockchain
BLOCKCHAIN_RPC_URL, CONTRACT_ADDRESS, CHAIN_ID, ADMIN_WALLET

# Optional - NFT
NFT_CONTRACT_ADDRESS, NEXT_PUBLIC_NFT_CONTRACT_ADDRESS, GEMINI_API_KEY

# Optional - AI
KOLOSAL_API_KEY
```

## Routes

| Route            | Description          |
| ---------------- | -------------------- |
| `/`              | Landing page         |
| `/login`         | Authentication       |
| `/scan`          | QR scanner           |
| `/verify/[code]` | Tag verification     |
| `/support`       | Web3 support tickets |
| `/explorer`      | Blockchain explorer  |
| `/manage/*`      | Admin dashboard      |
| `/docs`          | Swagger API docs     |

## Scripts

| Command                      | Description         |
| ---------------------------- | ------------------- |
| `npm run dev`                | Development server  |
| `npm run build`              | Production build    |
| `npm run test`               | Run tests           |
| `npm run test -- --coverage` | Tests with coverage |
| `npm run lint`               | ESLint              |
| `npm run typecheck`          | TypeScript check    |
| `npm run db:push`            | Push schema         |
| `npm run db:studio`          | Prisma Studio       |
| `npm run db:create-admin`    | Create admin user   |

## Docker

```bash
docker build -t etags .
docker run -p 3000:3000 -e DATABASE_URL="..." -e AUTH_SECRET="..." etags
```

## Architecture

```
src/
├── app/           # Next.js App Router
│   ├── api/       # API Routes
│   ├── manage/    # Admin Dashboard
│   └── support/   # Web3 Support
├── lib/
│   ├── actions/   # Server Actions
│   └── *.ts       # Utilities (db, auth, r2, blockchain)
├── components/
│   ├── ui/        # shadcn/ui components
│   └── landing/   # Landing page components
└── tests/         # Test setup & mocks
```

## NFT Collectible Flow

```
1. Scan QR → 2. Claim first-hand → 3. Connect wallet → 4. AI generates art → 5. Mint NFT → 6. Transfer to user
```

**Smart Contract:** `ETagCollectible` (ERC721) - One NFT per tag, gas-free minting

## Roadmap

| Phase   | Status | Features                                                               |
| ------- | ------ | ---------------------------------------------------------------------- |
| MVP     | ✅     | Brand/Product/Tag, Blockchain Stamping, NFT, AI Agent, Fraud Detection |
| Phase 2 | 🔜     | Wallet Authentication, Multi-sig Stamping                              |
| Phase 3 | 🔜     | Distribution Tracking, Supply Chain                                    |
| Phase 4 | 🔜     | Blockchain Warranty                                                    |
| Phase 5 | ✅     | Web3 Support Tickets                                                   |

See [ROADMAP.md](./ROADMAP.md) for details.

## License

MIT
