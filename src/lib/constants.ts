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
