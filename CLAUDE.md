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

### Database (Prisma with MySQL)

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database (no migration)
- `npm run db:migrate` - Create and apply migrations
- `npm run db:studio` - Open Prisma Studio GUI
- `npm run db:create-admin` - Create admin user (default: admin@example.com / admin123)
- `npm run db:create-admin -- email@example.com password123 "Name"` - Create admin with custom credentials

## Architecture

- **Framework**: Next.js 16 with App Router (`src/app/`)
- **Database**: MySQL via Prisma ORM
- **File Storage**: Cloudflare R2 (S3-compatible) via `@/lib/r2.ts`
- **Blockchain**: ethers.js for tag stamping via `@/lib/tag-sync.ts`
- **Styling**: Tailwind CSS v4 with `cn()` utility (clsx + tailwind-merge)
- **UI Components**: shadcn/ui components in `src/components/ui/`
- **React Compiler**: Enabled in next.config.ts

### Path Alias

`@/*` maps to `./src/*`

### Key Utilities

- `@/lib/db.ts` - Singleton Prisma client
- `@/lib/auth.ts` - NextAuth v5 configuration with credentials provider
- `@/lib/r2.ts` - R2 file upload/download with presigned URLs
- `@/lib/tag-sync.ts` - Blockchain tag operations (create, update, sync status)
- `@/lib/constants.ts` - Blockchain config and status enums (`CHAIN_STATUS`, `PUBLISH_STATUS`)
- `@/lib/swagger.ts` - OpenAPI/Swagger spec generation
- `@/lib/product-templates.ts` - Product metadata templates

### Server Actions

Server actions are organized in `src/lib/actions/`:

- `auth.ts` - Login/logout actions
- `brands.ts` - Brand CRUD operations
- `products.ts` - Product CRUD operations
- `tags.ts` - Tag CRUD and blockchain stamping
- `users.ts` - User management
- `profile.ts` - User profile updates
- `dashboard.ts` - Dashboard statistics

### Routes

- `/` - Public landing page
- `/login` - Login page (redirects to /manage if authenticated)
- `/manage` - Dashboard home with statistics
- `/manage/brands` - Brand management
- `/manage/products` - Product management
- `/manage/tags` - Tag management with blockchain stamping
- `/manage/users` - User management (admin only)
- `/manage/profile` - User profile settings
- `/docs` - Swagger API documentation UI
- `/api/docs` - OpenAPI JSON spec

### Database Schema

Core models in `prisma/schema.prisma`:

- **User** - Admin/brand users with role-based access (`role`: admin or brand)
- **Brand** - Product brand management with logo and descriptions
- **Product** - Products with JSON metadata, linked to brands
- **Tag** - Product tags with blockchain stamping (`is_stamped`, `hash_tx`, `chain_status`)

### Tag Blockchain Lifecycle

Tags have a `chain_status` tracking their blockchain state:

- 0: CREATED - Tag created on chain
- 1: DISTRIBUTED - Tag distributed to product
- 2: CLAIMED - Tag claimed by end user
- 3: TRANSFERRED - Ownership transferred
- 4: FLAGGED - Tag flagged for review
- 5: REVOKED - Tag revoked/invalidated

### Pre-commit Hook

Runs `typecheck` and `prettier --write` before commits.

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL` - MySQL connection string
- `AUTH_SECRET` - NextAuth secret (generate with `openssl rand -base64 32`)
- `AUTH_TRUST_HOST` - Set to `true` for production deployments
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` - Cloudflare R2 credentials
- `R2_PUBLIC_DOMAIN` - Public URL for R2 bucket assets
- `BLOCKCHAIN_RPC_URL`, `CONTRACT_ADDRESS`, `CHAIN_ID`, `ADMIN_WALLET` - Blockchain config
