# Etags Smart Contracts

Smart contracts untuk sistem penandaan produk dan verifikasi blockchain Etags.

## Overview

**ETagRegistry** adalah smart contract yang mengelola siklus hidup E-Tags di blockchain:

- Tag Creation & Batch Creation
- Tag Validation (by ID or Hash)
- Status Management (CREATED → DISTRIBUTED → CLAIMED → TRANSFERRED)
- Tag Revocation (untuk produk palsu)
- Access Control (Admin & Operator roles)
- Pausable (untuk emergency)

## Tech Stack

- **Solidity** ^0.8.20
- **Hardhat** - Development framework
- **OpenZeppelin** - Security contracts (AccessControl, Pausable)
- **Ethers.js** v6 - Ethereum interactions
- **Chai** - Testing assertions
- **TypeChain** - TypeScript bindings

## Quick Start

### 1. Install Dependencies

```bash
cd smartcontracts
npm install
```

### 2. Compile Contracts

```bash
npm run compile
```

### 3. Run Tests

```bash
# Run all tests
npm run test

# Run with gas reporting
npm run test:gas

# Run with coverage
npm run test:coverage
```

### 4. Local Development

Start a local Hardhat node (similar to Ganache):

```bash
# Terminal 1: Start local blockchain
npm run node

# Terminal 2: Deploy to local network
npm run deploy:local
```

### 5. Interact with Contract

```bash
# Set contract address
export CONTRACT_ADDRESS=<deployed_address>

# Run interaction script
npx hardhat run scripts/interact.ts --network localhost
```

## Testing

### Test Categories

| Category          | Description                                 |
| ----------------- | ------------------------------------------- |
| Deployment        | Role assignments, initial state             |
| Tag Creation      | Single & batch creation, validations        |
| Tag Validation    | Validate by ID, hash, existence check       |
| Status Management | Status transitions, lifecycle               |
| Tag Revocation    | Revoke with reason, validation after revoke |
| Access Control    | Role grants, operator permissions           |
| Pausable          | Pause/unpause, blocked operations           |
| Gas Optimization  | Gas usage benchmarks                        |

### Running Specific Tests

```bash
# Run only deployment tests
npx hardhat test --grep "Deployment"

# Run only tag creation tests
npx hardhat test --grep "Tag Creation"

# Run with verbose output
npx hardhat test --verbose
```

### Test Coverage

```bash
npm run test:coverage
```

Coverage report akan dihasilkan di `coverage/` folder.

## Deployment

### Deploy to Base Sepolia Testnet

1. Configure environment variables in root `.env`:

```env
ADMIN_WALLET=your_private_key
BLOCKCHAIN_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

2. Deploy:

```bash
npm run deploy:sepolia
```

3. Verify on BaseScan:

```bash
npm run verify <CONTRACT_ADDRESS>
```

## Contract Architecture

### Roles

| Role                 | Permissions                                  |
| -------------------- | -------------------------------------------- |
| `DEFAULT_ADMIN_ROLE` | Full admin access                            |
| `ADMIN_ROLE`         | Pause/unpause, revoke tags, manage operators |
| `OPERATOR_ROLE`      | Create tags, update status                   |

### Tag Status Lifecycle

```
CREATED (0)
    │
    ▼
DISTRIBUTED (1) ─── Tag dikirim ke retail
    │
    ▼
CLAIMED (2) ─────── User pertama mengklaim
    │
    ▼
TRANSFERRED (3) ─── Kepemilikan ditransfer
    │
    ▼
FLAGGED (4) ─────── Ditandai untuk investigasi
    │
    ▼
REVOKED (5) ─────── Dicabut (produk palsu)
```

### Key Functions

```solidity
// Create tag
function createTag(bytes32 tagId, bytes32 hash, string metadataURI) external;

// Batch create (max 50)
function createTagBatch(bytes32[] tagIds, bytes32[] hashes, string[] metadataURIs) external;

// Validate tag
function validateTag(bytes32 tagId) external view returns (bool isValid, ...);
function validateByHash(bytes32 hash) external view returns (bool isValid, ...);

// Update status
function updateStatus(bytes32 tagId, TagStatus newStatus) external;

// Revoke (admin only)
function revokeTag(bytes32 tagId, string reason) external;

// Access control
function grantOperator(address account) external;
function revokeOperator(address account) external;

// Emergency
function pause() external;
function unpause() external;
```

### Events

```solidity
event TagCreated(bytes32 indexed tagId, bytes32 indexed hash, string metadataURI, uint256 timestamp);
event TagStatusChanged(bytes32 indexed tagId, TagStatus oldStatus, TagStatus newStatus, uint256 timestamp);
event TagRevoked(bytes32 indexed tagId, string reason, uint256 timestamp);
```

## Gas Estimates

| Operation                | Estimated Gas |
| ------------------------ | ------------- |
| createTag                | ~150,000      |
| createTagBatch (10 tags) | ~800,000      |
| updateStatus             | ~50,000       |
| revokeTag                | ~60,000       |
| validateTag (view)       | Free          |

## Security Considerations

- ✅ AccessControl untuk role-based permissions
- ✅ Pausable untuk emergency stop
- ✅ Custom errors untuk gas efficiency
- ✅ Input validation untuk semua parameters
- ✅ Reentrancy safe (no external calls with state changes)
- ✅ Optimizer enabled untuk gas savings

## Development Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Run tests with gas report
npm run test:gas

# Generate coverage report
npm run test:coverage

# Start local node
npm run node

# Deploy to localhost
npm run deploy:local

# Deploy to Base Sepolia
npm run deploy:sepolia

# Clean build artifacts
npm run clean

# Generate TypeChain types
npm run typechain
```

## Directory Structure

```
smartcontracts/
├── contracts/
│   └── ETagRegistry.sol  # Main contract
├── ETagRegistry.abi.json # ABI for frontend
├── CONTRACT_USAGE.md     # Usage documentation
├── hardhat.config.ts     # Hardhat configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── test/
│   └── ETagRegistry.test.ts  # Unit tests
├── scripts/
│   ├── deploy.ts         # Deployment script
│   └── interact.ts       # Interaction examples
├── artifacts/            # Compiled contracts
├── cache/                # Hardhat cache
└── typechain-types/      # Generated TypeScript types
```

## Troubleshooting

### Common Issues

**Error: Missing ADMIN_WALLET**

```
Pastikan ADMIN_WALLET di-set di .env dengan private key yang valid
```

**Error: Insufficient funds**

```
Pastikan wallet memiliki ETH di Base Sepolia testnet
Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
```

**Error: Contract not verified**

```
Tunggu beberapa menit setelah deploy, lalu jalankan:
npm run verify <CONTRACT_ADDRESS>
```

## License

MIT License
