import { ethers } from 'ethers';
import { prisma } from './db';
import { BLOCKCHAIN_CONFIG, type ChainStatus } from './constants';

// ABI for ETagRegistry contract
const TAG_CONTRACT_ABI = [
  // Create tag: tagId (bytes32), hash (bytes32), metadataURI (string)
  'function createTag(bytes32 tagId, bytes32 hash, string metadataURI)',
  // Update status: tagId (bytes32), newStatus (uint8) - cannot set to REVOKED
  'function updateStatus(bytes32 tagId, uint8 newStatus)',
  // Revoke tag: tagId (bytes32), reason (string) - Admin only, sets to REVOKED
  'function revokeTag(bytes32 tagId, string reason)',
  // Validate tag: returns (isValid, hash, metadataURI, status, createdAt)
  'function validateTag(bytes32 tagId) view returns (bool isValid, bytes32 hash, string metadataURI, uint8 status, uint256 createdAt)',
  // Check if tag exists by hash
  'function tagExistsByHash(bytes32 hash) view returns (bool)',
  // Get total tags count
  'function totalTags() view returns (uint256)',
];

function getProvider() {
  return new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.RPC_URL);
}

function getAdminSigner() {
  const provider = getProvider();
  const privateKey = process.env.ADMIN_WALLET;
  if (!privateKey) {
    throw new Error('ADMIN_WALLET environment variable is not set');
  }
  return new ethers.Wallet(privateKey, provider);
}

function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  if (!BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS) {
    throw new Error(
      'CONTRACT_ADDRESS environment variable is not set. Please configure it in your .env file.'
    );
  }
  return new ethers.Contract(
    BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS,
    TAG_CONTRACT_ABI,
    signerOrProvider
  );
}

/**
 * Convert tag code string to bytes32
 * Uses keccak256 hash of the tag code
 */
export function tagCodeToBytes32(tagCode: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(tagCode));
}

/**
 * Generate a content hash from tag metadata
 * This creates a unique hash of the tag's content for verification
 */
export function generateContentHash(
  tagCode: string,
  metadataUri: string,
  productIds: number[]
): string {
  const content = JSON.stringify({
    tagCode,
    metadataUri,
    productIds: productIds.sort(),
    timestamp: Date.now(),
  });
  return ethers.keccak256(ethers.toUtf8Bytes(content));
}

/**
 * Fetch tag status from blockchain and sync to database
 */
export async function syncTagStatus(
  tagCode: string
): Promise<ChainStatus | null> {
  const provider = getProvider();
  const contract = getContract(provider);

  try {
    const tagId = tagCodeToBytes32(tagCode);
    const result = await contract.validateTag(tagId);

    if (!result.isValid) {
      return null;
    }

    const status = Number(result.status) as ChainStatus;

    await prisma.tag.update({
      where: { code: tagCode },
      data: { chain_status: status },
    });

    return status;
  } catch (error) {
    console.error(`Failed to sync tag status for ${tagCode}:`, error);
    return null;
  }
}

/**
 * Update tag status on blockchain and sync to database
 */
export async function updateTagChainStatus(
  tagCode: string,
  newStatus: ChainStatus
): Promise<{ success: boolean; txHash?: string }> {
  const signer = getAdminSigner();
  const contract = getContract(signer);

  try {
    const tagId = tagCodeToBytes32(tagCode);
    const tx = await contract.updateStatus(tagId, newStatus);
    const receipt = await tx.wait();

    await prisma.tag.update({
      where: { code: tagCode },
      data: {
        chain_status: newStatus,
        hash_tx: receipt.hash,
      },
    });

    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error(`Failed to update tag status for ${tagCode}:`, error);
    return { success: false };
  }
}

/**
 * Create tag on blockchain and update database
 * @param tagCode - The unique tag code
 * @param metadataUri - URI to the static metadata JSON on R2
 * @param productIds - Array of product IDs for hash generation
 */
export async function createTagOnChain(
  tagCode: string,
  metadataUri: string,
  productIds: number[] = []
): Promise<{
  success: boolean;
  txHash?: string;
  tagId?: string;
  contentHash?: string;
}> {
  const signer = getAdminSigner();
  const contract = getContract(signer);

  try {
    // Generate bytes32 values
    const tagId = tagCodeToBytes32(tagCode);
    const contentHash = generateContentHash(tagCode, metadataUri, productIds);

    console.log('Creating tag on chain:', {
      tagCode,
      tagId,
      contentHash,
      metadataUri,
    });

    // Call createTag with bytes32 tagId, bytes32 hash, and string metadataURI
    const tx = await contract.createTag(tagId, contentHash, metadataUri);
    const receipt = await tx.wait();

    await prisma.tag.update({
      where: { code: tagCode },
      data: {
        is_stamped: 1,
        chain_status: 0, // CREATED
        hash_tx: receipt.hash,
      },
    });

    return {
      success: true,
      txHash: receipt.hash,
      tagId,
      contentHash,
    };
  } catch (error) {
    console.error(`Failed to create tag on chain for ${tagCode}:`, error);
    return { success: false };
  }
}

/**
 * Validate tag on blockchain
 */
export async function validateTagOnChain(tagCode: string): Promise<{
  isValid: boolean;
  hash?: string;
  metadataUri?: string;
  status?: ChainStatus;
  createdAt?: Date;
} | null> {
  const provider = getProvider();
  const contract = getContract(provider);

  try {
    const tagId = tagCodeToBytes32(tagCode);
    const result = await contract.validateTag(tagId);

    if (!result.isValid) {
      return { isValid: false };
    }

    return {
      isValid: true,
      hash: result.hash,
      metadataUri: result.metadataURI,
      status: Number(result.status) as ChainStatus,
      createdAt: new Date(Number(result.createdAt) * 1000),
    };
  } catch (error) {
    console.error(`Failed to validate tag ${tagCode}:`, error);
    return null;
  }
}

/**
 * Revoke tag on blockchain (Admin only)
 * Sets status to REVOKED (5) with a reason
 */
export async function revokeTagOnChain(
  tagCode: string,
  reason: string
): Promise<{ success: boolean; txHash?: string }> {
  const signer = getAdminSigner();
  const contract = getContract(signer);

  try {
    const tagId = tagCodeToBytes32(tagCode);
    const tx = await contract.revokeTag(tagId, reason);
    const receipt = await tx.wait();

    await prisma.tag.update({
      where: { code: tagCode },
      data: {
        chain_status: 5, // REVOKED
        hash_tx: receipt.hash,
      },
    });

    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error(`Failed to revoke tag ${tagCode}:`, error);
    return { success: false };
  }
}

/**
 * Sync all tags that are stamped but may have outdated chain status
 */
export async function syncAllStampedTags(): Promise<number> {
  const stampedTags = await prisma.tag.findMany({
    where: { is_stamped: 1 },
    select: { code: true },
  });

  let syncedCount = 0;
  for (const tag of stampedTags) {
    const result = await syncTagStatus(tag.code);
    if (result !== null) syncedCount++;
  }

  return syncedCount;
}

/**
 * Get total tags count from blockchain
 */
export async function getTotalTagsOnChain(): Promise<number> {
  const provider = getProvider();
  const contract = getContract(provider);

  try {
    const total = await contract.totalTags();
    return Number(total);
  } catch (error) {
    console.error('Failed to get total tags:', error);
    return 0;
  }
}
