// Blockchain configuration constants

export const BLOCKCHAIN_CONFIG = {
  RPC_URL: process.env.BLOCKCHAIN_RPC_URL || 'https://rpc.example.com',
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || '',
  CHAIN_ID: parseInt(process.env.CHAIN_ID || '1', 10),
} as const;

// Tag chain status values matching blockchain lifecycle
export const CHAIN_STATUS = {
  CREATED: 0,
  DISTRIBUTED: 1,
  CLAIMED: 2,
  TRANSFERRED: 3,
  FLAGGED: 4,
  REVOKED: 5,
} as const;

export type ChainStatus = (typeof CHAIN_STATUS)[keyof typeof CHAIN_STATUS];

// Tag publish status (internal app state)
export const PUBLISH_STATUS = {
  DRAFT: 0,
  PUBLISHED: 1,
} as const;

export type PublishStatus =
  (typeof PUBLISH_STATUS)[keyof typeof PUBLISH_STATUS];

// Get chain status label
export function getChainStatusLabel(status: number | null): string {
  if (status === null) return 'Not on chain';

  const labels: Record<number, string> = {
    [CHAIN_STATUS.CREATED]: 'Created',
    [CHAIN_STATUS.DISTRIBUTED]: 'Distributed',
    [CHAIN_STATUS.CLAIMED]: 'Claimed',
    [CHAIN_STATUS.TRANSFERRED]: 'Transferred',
    [CHAIN_STATUS.FLAGGED]: 'Flagged',
    [CHAIN_STATUS.REVOKED]: 'Revoked',
  };

  return labels[status] || 'Unknown';
}
