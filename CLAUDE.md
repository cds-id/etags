# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Etags is a Next.js 16 application for product tagging and blockchain stamping. It manages brands, products, and tags with blockchain transaction tracking for authentication/verification purposes.

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting without writing
- `npm run commit` - Commitizen conventional commit

### Testing (Vitest)

- `npm run test` - Run tests in watch mode
- `npm run test -- --run` - Run tests once (CI mode)
- `npm run test -- --coverage` - Run tests with coverage
- `npm run test -- src/lib/actions/auth.test.ts` - Run a single test file

Test files use `*.test.{ts,tsx}` naming convention and are located throughout `src/`. Test setup is in `src/tests/setup.ts` with mocks in `src/tests/mocks.ts`. Coverage is configured only for `src/lib/actions/**/*.ts`.

### Database (Prisma with MySQL)

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database (no migration)
- `npm run db:migrate` - Create and apply migrations
- `npm run db:studio` - Open Prisma Studio GUI
- `npm run db:create-admin` - Create admin user (default: admin@example.com / admin123)
- `npm run db:create-admin -- email@example.com password123 "Name"` - Create admin with custom credentials
- `npm run db:seed` - Seed basic sample data
- `npm run db:seed-fraud` - Add fraud scan patterns to existing tags
- `npm run db:seed-complete` - Complete seed with brands, users, products, tags, and suspicious scans
- `npm run db:seed-complete -- --upload-r2` - Same as above but uploads QR codes to R2
- `npm run db:seed-complete -- --clean` - Clean existing data before seeding

## Architecture

- **Framework**: Next.js 16 with App Router (`src/app/`)
- **Database**: MySQL via Prisma ORM
- **File Storage**: Cloudflare R2 (S3-compatible) via `@/lib/r2.ts`
- **Blockchain**: ethers.js for tag stamping on Base Sepolia via `@/lib/tag-sync.ts`
- **Styling**: Tailwind CSS v4 with `cn()` utility (clsx + tailwind-merge)
- **UI Components**: shadcn/ui components in `src/components/ui/`
- **React Compiler**: Enabled in next.config.ts
- **AI Integration**: Kolosal AI for fraud detection via `@/lib/kolosal-ai.ts`

### Path Alias

`@/*` maps to `./src/*`

### Key Utilities

- `@/lib/db.ts` - Singleton Prisma client
- `@/lib/auth.ts` - NextAuth v5 configuration with credentials provider
- `@/lib/r2.ts` - R2 file upload/download with presigned URLs
- `@/lib/tag-sync.ts` - Blockchain tag operations (create, update, sync, revoke)
- `@/lib/tag-stamping.ts` - Tag stamping workflow helpers
- `@/lib/constants.ts` - Blockchain config and status enums (`CHAIN_STATUS`, `PUBLISH_STATUS`)
- `@/lib/fraud-detection.ts` - AI-powered fraud analysis for tag scans
- `@/lib/qr-generator.ts` - QR code generation for tags
- `@/lib/qr-template-generator.ts` - Designed QR code templates
- `@/lib/explorer.ts` - Blockchain explorer integration
- `@/lib/rate-limit.ts` - Rate limiting for API endpoints
- `@/lib/csrf.ts` - CSRF protection
- `@/lib/nft-collectible.ts` - NFT minting and claim processing
- `@/lib/gemini-image.ts` - Gemini API for NFT art generation

### Server Actions

Server actions are organized in `src/lib/actions/`:

- `auth.ts` - Login/logout actions
- `brands.ts` - Brand CRUD operations
- `products.ts` - Product CRUD operations
- `tags.ts` - Tag CRUD and blockchain stamping
- `users.ts` - User management
- `profile.ts` - User profile updates
- `dashboard.ts` - Dashboard statistics
- `onboarding.ts` - User onboarding flow
- `my-brand.ts` - Brand user self-management
- `ai-agent.ts` - AI agent integration
- `nfts.ts` - NFT collectible management and stats

### Routes

**Admin Dashboard (`/manage`):**

- `/manage` - Dashboard home with statistics
- `/manage/brands` - Brand management
- `/manage/products` - Product CRUD with `/new` and `/[id]/edit`
- `/manage/tags` - Tag management with `/new` and `/[id]/edit`
- `/manage/nfts` - NFT collectible monitoring with `/[id]` detail view
- `/manage/users` - User management (admin only)
- `/manage/profile` - User profile settings

**Public Routes:**

- `/` - Public landing page
- `/login` - Login page (redirects to /manage if authenticated)
- `/scan` - QR code scanner for tag verification
- `/verify/[code]` - Tag verification page with product details
- `/explorer` - Blockchain transaction explorer
- `/explorer/tx/[hash]` - Transaction detail page
- `/docs` - Swagger API documentation UI

**API Routes:**

- `/api/docs` - OpenAPI JSON spec
- `/api/scan` - Tag scan endpoint (records scans with fingerprint)
- `/api/scan/claim` - Claim a tag as owner
- `/api/scan/claim-nft` - Claim NFT collectible for first-hand claimers
- `/api/verify` - Tag verification API
- `/api/explorer` - Blockchain explorer API
- `/api/csrf` - CSRF token endpoint
- `/api/tags/[code]/designed` - Get designed QR code for tag
- `/api/tags/template-preview` - Preview QR template designs
- `/api/ai-agent` - AI agent chat endpoint for dashboard

### Database Schema

Core models in `prisma/schema.prisma`:

- **User** - Admin/brand users with role-based access (`role`: admin or brand), linked to brand via `brand_id`
- **Brand** - Product brand management with logo and descriptions
- **Product** - Products with JSON metadata (`name`, `description`, `price`, `images[]`), linked to brands
- **Tag** - Product tags with blockchain stamping (`is_stamped`, `hash_tx`, `chain_status`), stores `product_ids` as JSON array
- **TagScan** - Scan history with fingerprinting, location, claim status, and ownership tracking (`is_first_hand`, `source_info`)
- **TagNFT** - NFT collectibles minted for first-hand claimers (`token_id`, `owner_address`, `image_url`, `metadata_url`, `mint_tx_hash`)

### Tag Blockchain Lifecycle

Tags have a `chain_status` tracking their blockchain state:

- 0: CREATED - Tag created on chain
- 1: DISTRIBUTED - Tag distributed to product
- 2: CLAIMED - Tag claimed by end user
- 3: TRANSFERRED - Ownership transferred
- 4: FLAGGED - Tag flagged for review
- 5: REVOKED - Tag revoked/invalidated

The blockchain contract (ETagRegistry) supports: `createTag`, `updateStatus`, `revokeTag`, `validateTag`.

### Tag Scanning Flow

1. User scans QR code → `/scan` page
2. Browser collects fingerprint (FingerprintJS) and location
3. POST to `/api/scan` records the scan in `TagScan` with sequential `scan_number`
4. Redirects to `/verify/[code]` showing product info
5. User can claim ownership via `/api/scan/claim` (sets `is_claimed`, asks about `is_first_hand`)
6. AI fraud detection analyzes scan patterns and location vs distribution info

### NFT Collectible Claim Flow

First-hand tag claimers on Web3 browsers can mint an NFT collectible:

1. User claims tag as first-hand owner on `/verify/[code]`
2. System detects Web3 wallet (MetaMask, etc.) via `window.ethereum`
3. User connects wallet and switches to Base Sepolia (Chain ID: 84532)
4. POST to `/api/scan/claim-nft` triggers NFT minting:
   - Generates unique art via Gemini API (`gemini-3-pro-image-preview`)
   - Uploads image and metadata to R2: `nfts/{tagCode}/`
   - Admin wallet mints NFT via ETagCollectible contract (user doesn't pay gas)
   - NFT transferred directly to user's wallet
5. TagNFT record created with `token_id`, `owner_address`, `mint_tx_hash`
6. Admin monitors NFTs at `/manage/nfts`

**Smart Contracts:**

- `ETagCollectible.sol` - ERC721 NFT contract with one-NFT-per-tag enforcement
- Functions: `mintTo()`, `isTagMinted()`, `getTokenByTag()`, `grantMinter()`, `pause()`

### Pre-commit Hook

Runs `typecheck` and `lint-staged` (which runs Prettier on staged files) before commits.

### Docker

- `docker build -t etags .` - Build production image (multi-stage, uses standalone output)
- `docker run -p 3000:3000 -e DATABASE_URL="..." -e AUTH_SECRET="..." etags` - Run container

### CI/CD (GitHub Actions)

Triggers:

- Push to `master` branch
- Pull requests targeting `develop`, `feature/*`, `fix/*` branches

Pipeline: lint → typecheck → test → build

### Smart Contracts

Solidity contracts are in `smartcontracts/` directory with separate Hardhat setup. See `smartcontracts/README.md` for contract development and testing.

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL` - MySQL connection string
- `AUTH_SECRET` - NextAuth secret (generate with `openssl rand -base64 32`)
- `AUTH_TRUST_HOST` - Set to `true` for production deployments
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` - Cloudflare R2 credentials
- `R2_PUBLIC_DOMAIN` - Public URL for R2 bucket assets
- `BLOCKCHAIN_RPC_URL`, `CONTRACT_ADDRESS`, `CHAIN_ID`, `ADMIN_WALLET`, `BLOCKCHAIN_NETWORK` - Blockchain config
- `CONTRACT_OWNER` - Optional: Owner address different from deployer (for contract deployment)
- `BLOCKCHAIN_EXPLORER_URL` - Block explorer URL (default: Base Sepolia)
- `NFT_CONTRACT_ADDRESS`, `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` - ETagCollectible NFT contract address
- `GEMINI_API_KEY` - Gemini API for NFT art generation
- `KOLOSAL_API_KEY` - Kolosal AI for fraud detection
- `BASESCAN_API_KEY` - BaseScan API for explorer features
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Mapbox token for scan location maps
