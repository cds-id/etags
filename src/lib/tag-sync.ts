import { ethers } from 'ethers';
import { prisma } from './db';
import { BLOCKCHAIN_CONFIG, type ChainStatus } from './constants';

// Minimal ABI for tag status operations
const TAG_CONTRACT_ABI = [
  'function getTagStatus(string tagCode) view returns (uint8)',
  'function createTag(string tagCode) returns (bytes32)',
  'function updateTagStatus(string tagCode, uint8 status) returns (bool)',
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
  return new ethers.Contract(
    BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS,
    TAG_CONTRACT_ABI,
    signerOrProvider
  );
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
    const chainStatus = await contract.getTagStatus(tagCode);
    const status = Number(chainStatus) as ChainStatus;

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
    const tx = await contract.updateTagStatus(tagCode, newStatus);
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
 */
export async function createTagOnChain(
  tagCode: string
): Promise<{ success: boolean; txHash?: string }> {
  const signer = getAdminSigner();
  const contract = getContract(signer);

  try {
    const tx = await contract.createTag(tagCode);
    const receipt = await tx.wait();

    await prisma.tag.update({
      where: { code: tagCode },
      data: {
        is_stamped: 1,
        chain_status: 0, // CREATED
        hash_tx: receipt.hash,
      },
    });

    return { success: true, txHash: receipt.hash };
  } catch (error) {
    console.error(`Failed to create tag on chain for ${tagCode}:`, error);
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
