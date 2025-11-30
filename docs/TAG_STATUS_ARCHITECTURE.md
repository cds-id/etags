# Tag Status Analysis: Database vs Blockchain

## Current Architecture Review

After reviewing the [CONTRACT_USAGE.md](file:///home/nst/WebstormProjects/etags/smartcontracts/CONTRACT_USAGE.md) and Prisma schema, there's an **important distinction** between database status and blockchain status that needs clarification.

---

## Two Different "Status" Fields

### 1. **Database Status** (Prisma Schema)

Located in the `tags` table:

```prisma
status Int @default(0) @db.TinyInt // 0 = draft, 1 = published
```

**Purpose**: Internal application state before blockchain stamping

- `0` = **DRAFT** - Tag created in database but not yet stamped to blockchain
- `1` = **PUBLISHED** - Tag is stamped and ready for use

**Requirement**: Must have `is_stamped = 1` before status can be set to `1`

### 2. **Blockchain Status** (Smart Contract)

Located in the `ETagRegistry` contract:

| Value | Status      | Description               |
| ----- | ----------- | ------------------------- |
| 0     | CREATED     | Just created              |
| 1     | DISTRIBUTED | Sent to retail            |
| 2     | CLAIMED     | First owner claimed       |
| 3     | TRANSFERRED | Ownership transferred     |
| 4     | FLAGGED     | Flagged for investigation |
| 5     | REVOKED     | Revoked (counterfeit)     |

**Purpose**: Track tag lifecycle on-chain for transparency and immutability

---

## Recommended Architecture

### Schema Update

Your Prisma schema should have **both** statuses:

```diff
model Tag {
  id              Int      @id @default(autoincrement())
  code            String   @unique @db.VarChar(100)
  product_ids     Json
  metadata        Json
  is_stamped      Int      @default(0) @db.TinyInt
  hash_tx         String?  @db.VarChar(255)
- status          Int      @default(0) @db.TinyInt // 0 = draft, 1 = published
+ publish_status  Int      @default(0) @db.TinyInt // 0 = draft, 1 = published (internal)
+ chain_status    Int?     @db.TinyInt // Blockchain status (0-5), nullable if not yet stamped
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  @@map("tags")
}
```

### Workflow Integration

#### **Step 1: Create Draft Tag** (Database Only)

```typescript
const tag = await prisma.tag.create({
  data: {
    code: 'TAG-001',
    product_ids: [1, 2, 3],
    metadata: {
      /* ... */
    },
    publish_status: 0, // draft
    is_stamped: 0,
    chain_status: null, // not on chain yet
  },
});
```

#### **Step 2: Stamp to Blockchain**

```typescript
// 1. Create tag on blockchain
const tagId = ethers.encodeBytes32String('TAG-001');
const hash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(metadata)));
const metadataURI = 'ipfs://QmYourMetadataHash';

const tx = await registry.createTag(tagId, hash, metadataURI);
await tx.wait();

// 2. Update database
await prisma.tag.update({
  where: { code: 'TAG-001' },
  data: {
    is_stamped: 1,
    hash_tx: tx.hash,
    chain_status: 0, // CREATED status on chain
  },
});
```

#### **Step 3: Publish Tag** (Make visible to public)

```typescript
await prisma.tag.update({
  where: { code: 'TAG-001' },
  data: {
    publish_status: 1, // now published
  },
});
```

#### **Step 4: Update Lifecycle Status** (Distributed, Claimed, etc.)

```typescript
// Update on blockchain
await registry.updateStatus(tagId, 1); // DISTRIBUTED

// Sync to database
await prisma.tag.update({
  where: { code: 'TAG-001' },
  data: {
    chain_status: 1, // DISTRIBUTED
  },
});
```

---

## Why Both Status Fields?

### `publish_status` (Database)

- **Controls visibility** in your application
- Allows drafts to be created and reviewed before blockchain stamping
- Once published, users can scan and validate the tag
- **Does NOT need** to be on blockchain

### `chain_status` (Blockchain)

- **Tracks lifecycle** for transparency and auditability
- Immutable record of tag journey (created → distributed → claimed)
- Can be validated by anyone with blockchain access
- **Must be** synchronized with blockchain state

---

## Implementation Recommendations

### 1. Add `chain_status` to Prisma Schema

```prisma
model Tag {
  // ... existing fields
  publish_status Int  @default(0) @db.TinyInt // 0 = draft, 1 = published
  chain_status   Int? @db.TinyInt // Blockchain status (0-5), null if not stamped
  // ...

  @@map("tags")
}
```

### 2. Create Status Sync Service

```typescript
// src/lib/blockchain/tag-sync.ts
import { prisma } from '@/lib/db';
import { ethers } from 'ethers';
import abi from '@/smartcontracts/ETagRegistry.abi.json';

const CONTRACT_ADDRESS = '0x51162BEA5FB292CBabF2715e0686bF6165baaEC1';
const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
const registry = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

export async function syncTagStatus(tagCode: string) {
  const tag = await prisma.tag.findUnique({ where: { code: tagCode } });

  if (!tag || !tag.is_stamped) {
    throw new Error('Tag not stamped to blockchain');
  }

  const tagId = ethers.encodeBytes32String(tagCode);
  const result = await registry.validateTag(tagId);

  // Update database with blockchain status
  await prisma.tag.update({
    where: { code: tagCode },
    data: {
      chain_status: Number(result.status),
    },
  });

  return result;
}
```

### 3. Status Update Flow

```typescript
// Update status on blockchain AND database
export async function updateTagChainStatus(
  tagCode: string,
  newStatus: number, // 0-5
  wallet: ethers.Wallet
) {
  const tagId = ethers.encodeBytes32String(tagCode);
  const registryWithSigner = registry.connect(wallet);

  // Update on blockchain
  const tx = await registryWithSigner.updateStatus(tagId, newStatus);
  await tx.wait();

  // Sync to database
  await prisma.tag.update({
    where: { code: tagCode },
    data: {
      chain_status: newStatus,
    },
  });
}
```

---

## Summary

> [!IMPORTANT]
> Your intuition is **correct** - tag status should be stored on-chain after `is_stamped = true`. However, you should maintain **TWO separate status fields**:

1. **`publish_status`** (database only) - Controls application visibility (draft/published)
2. **`chain_status`** (synced with blockchain) - Tracks lifecycle (created/distributed/claimed/etc.)

This separation provides:

- ✅ Draft capability before blockchain stamping
- ✅ Complete lifecycle tracking on-chain
- ✅ Easy synchronization between database and blockchain
- ✅ Single source of truth for tag authenticity (blockchain)

The blockchain already has the `updateStatus()` function ready - you just need to:

1. Add `chain_status` field to your database schema
2. Create sync service to keep database in sync with blockchain
3. Use `publish_status` for internal draft/publish workflow
