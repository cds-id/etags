# ETagRegistry Contract Usage

## Deployment Info

| Network      | Address                                      | Chain ID |
| ------------ | -------------------------------------------- | -------- |
| Base Sepolia | `0x51162BEA5FB292CBabF2715e0686bF6165baaEC1` | 84532    |

## ABI

ABI file: `deployments/ETagRegistry.abi.json`

## Contract Overview

ETagRegistry is a simplified tag registry for product authentication on Base Chain. Tags are created by operators (off-chain triggered) and validated on-chain.

## Roles

| Role            | Description                                         |
| --------------- | --------------------------------------------------- |
| `ADMIN_ROLE`    | Full control - pause, revoke tags, manage operators |
| `OPERATOR_ROLE` | Create tags, update status                          |

## Tag Status

| Value | Status      | Description               |
| ----- | ----------- | ------------------------- |
| 0     | CREATED     | Just created              |
| 1     | DISTRIBUTED | Sent to retail            |
| 2     | CLAIMED     | First owner claimed       |
| 3     | TRANSFERRED | Ownership transferred     |
| 4     | FLAGGED     | Flagged for investigation |
| 5     | REVOKED     | Revoked (counterfeit)     |

## Functions

### Write Functions (Requires Role)

#### `createTag(bytes32 tagId, bytes32 hash, string metadataURI)`

Create a single tag. Requires `OPERATOR_ROLE`.

```javascript
// Example with ethers.js
const tagId = ethers.encodeBytes32String('TAG-001');
const hash = ethers.keccak256(ethers.toUtf8Bytes('product-metadata'));
const metadataURI = 'ipfs://QmYourMetadataHash';

await registry.createTag(tagId, hash, metadataURI);
```

#### `createTagBatch(bytes32[] tagIds, bytes32[] hashes, string[] metadataURIs)`

Create multiple tags (max 50). Requires `OPERATOR_ROLE`.

```javascript
const tagIds = [
  ethers.encodeBytes32String('TAG-001'),
  ethers.encodeBytes32String('TAG-002'),
];
const hashes = [
  ethers.keccak256(ethers.toUtf8Bytes('product-1')),
  ethers.keccak256(ethers.toUtf8Bytes('product-2')),
];
const metadataURIs = ['ipfs://Qm...', 'ipfs://Qm...'];

await registry.createTagBatch(tagIds, hashes, metadataURIs);
```

#### `updateStatus(bytes32 tagId, uint8 newStatus)`

Update tag status. Requires `OPERATOR_ROLE`. Cannot set to REVOKED (use `revokeTag`).

```javascript
// Set to DISTRIBUTED (1)
await registry.updateStatus(tagId, 1);
```

#### `revokeTag(bytes32 tagId, string reason)`

Revoke a counterfeit tag. Requires `ADMIN_ROLE`.

```javascript
await registry.revokeTag(tagId, 'Confirmed counterfeit');
```

#### `grantOperator(address account)`

Grant operator role. Requires `ADMIN_ROLE`.

```javascript
await registry.grantOperator('0x...');
```

#### `revokeOperator(address account)`

Revoke operator role. Requires `ADMIN_ROLE`.

```javascript
await registry.revokeOperator('0x...');
```

#### `pause()` / `unpause()`

Pause/unpause contract. Requires `ADMIN_ROLE`.

---

### Read Functions (No Role Required)

#### `validateTag(bytes32 tagId)`

Validate a tag by ID. Returns tag details and validity.

```javascript
const result = await registry.validateTag(tagId);
// Returns: { isValid, hash, metadataURI, status, createdAt }

if (result.isValid) {
  console.log('Tag is authentic!');
  console.log('Metadata:', result.metadataURI);
} else {
  console.log('Tag is invalid or revoked!');
}
```

#### `validateByHash(bytes32 hash)`

Validate a tag by product hash.

```javascript
const hash = ethers.keccak256(ethers.toUtf8Bytes('product-data'));
const result = await registry.validateByHash(hash);
// Returns: { isValid, tagId, metadataURI, status, createdAt }
```

#### `tagExistsByHash(bytes32 hash)`

Check if tag exists.

```javascript
const exists = await registry.tagExistsByHash(hash);
```

#### `totalTags()`

Get total number of tags created.

```javascript
const total = await registry.totalTags();
```

---

## Integration Examples

### Node.js / Backend

```javascript
const { ethers } = require('ethers');
const abi = require('./deployments/ETagRegistry.abi.json');

const CONTRACT_ADDRESS = '0x51162BEA5FB292CBabF2715e0686bF6165baaEC1';
const RPC_URL = 'https://sepolia.base.org';

// Read-only provider
const provider = new ethers.JsonRpcProvider(RPC_URL);
const registry = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

// Validate tag
async function validateProduct(productHash) {
  const result = await registry.validateByHash(productHash);
  return {
    isAuthentic: result.isValid,
    tagId: result.tagId,
    metadata: result.metadataURI,
    status: Number(result.status),
  };
}

// With signer (for write operations)
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const registryWithSigner = registry.connect(wallet);

// Create tag
async function createTag(id, productData, metadataURI) {
  const tagId = ethers.encodeBytes32String(id);
  const hash = ethers.keccak256(ethers.toUtf8Bytes(productData));
  const tx = await registryWithSigner.createTag(tagId, hash, metadataURI);
  await tx.wait();
  return tx.hash;
}
```

### React / Frontend

```javascript
import { useReadContract, useWriteContract } from 'wagmi';
import abi from './ETagRegistry.abi.json';

const CONTRACT_ADDRESS = '0x51162BEA5FB292CBabF2715e0686bF6165baaEC1';

function useValidateTag(tagId) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'validateTag',
    args: [tagId],
  });
}

function useCreateTag() {
  const { writeContract } = useWriteContract();

  return (tagId, hash, metadataURI) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'createTag',
      args: [tagId, hash, metadataURI],
    });
  };
}
```

### Thirdweb SDK

```javascript
import { ThirdwebSDK } from '@thirdweb-dev/sdk';

const sdk = new ThirdwebSDK('base-sepolia');
const contract = await sdk.getContract(
  '0x51162BEA5FB292CBabF2715e0686bF6165baaEC1'
);

// Validate
const result = await contract.call('validateTag', [tagId]);

// Create (requires connected wallet)
await contract.call('createTag', [tagId, hash, metadataURI]);
```

---

## Events

| Event              | Parameters                             | Description     |
| ------------------ | -------------------------------------- | --------------- |
| `TagCreated`       | tagId, hash, metadataURI, timestamp    | New tag created |
| `TagStatusChanged` | tagId, oldStatus, newStatus, timestamp | Status updated  |
| `TagRevoked`       | tagId, reason, timestamp               | Tag revoked     |

### Listening to Events

```javascript
registry.on('TagCreated', (tagId, hash, metadataURI, timestamp) => {
  console.log(`New tag: ${tagId}`);
});

registry.on('TagRevoked', (tagId, reason, timestamp) => {
  console.log(`Tag revoked: ${tagId}, reason: ${reason}`);
});
```

---

## Error Handling

| Error                                            | Cause                      |
| ------------------------------------------------ | -------------------------- |
| `TagAlreadyExists(tagId)`                        | Tag ID already registered  |
| `TagNotFound(tagId)`                             | Tag doesn't exist          |
| `HashAlreadyRegistered(hash)`                    | Product hash already used  |
| `InvalidMetadataURI()`                           | Empty metadata URI         |
| `AccessControl: account ... is missing role ...` | Caller lacks required role |
| `Pausable: paused`                               | Contract is paused         |

---

## Gas Estimates (Base Sepolia)

| Function            | Estimated Gas | Est. Cost (0.001 gwei) |
| ------------------- | ------------- | ---------------------- |
| createTag           | ~150,000      | ~$0.00015              |
| createTagBatch (10) | ~800,000      | ~$0.0008               |
| updateStatus        | ~50,000       | ~$0.00005              |
| revokeTag           | ~60,000       | ~$0.00006              |
