import { ethers } from 'ethers';
import { BLOCKCHAIN_CONFIG, getChainStatusLabel } from './constants';

// Full ABI for ETagRegistry contract with events
export const TAG_CONTRACT_ABI = [
  // Functions
  'function createTag(bytes32 tagId, bytes32 hash, string metadataURI)',
  'function updateStatus(bytes32 tagId, uint8 newStatus)',
  'function revokeTag(bytes32 tagId, string reason)',
  'function validateTag(bytes32 tagId) view returns (bool isValid, bytes32 hash, string metadataURI, uint8 status, uint256 createdAt)',
  'function tagExistsByHash(bytes32 hash) view returns (bool)',
  'function totalTags() view returns (uint256)',
  'function owner() view returns (address)',
  // Events
  'event TagCreated(bytes32 indexed tagId, bytes32 hash, string metadataURI, uint256 timestamp)',
  'event TagStatusUpdated(bytes32 indexed tagId, uint8 oldStatus, uint8 newStatus, uint256 timestamp)',
  'event TagRevoked(bytes32 indexed tagId, string reason, uint256 timestamp)',
];

// Function signatures for decoding
export const FUNCTION_SIGNATURES: Record<
  string,
  { name: string; inputs: string[] }
> = {
  '0x8a71bb40': {
    name: 'createTag',
    inputs: ['bytes32 tagId', 'bytes32 hash', 'string metadataURI'],
  },
  '0x5e4c0a05': {
    name: 'updateStatus',
    inputs: ['bytes32 tagId', 'uint8 newStatus'],
  },
  '0x9e2c8a5b': {
    name: 'revokeTag',
    inputs: ['bytes32 tagId', 'string reason'],
  },
};

export type DecodedTransaction = {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: 'success' | 'failed' | 'pending';
  method: string;
  methodName: string;
  decodedInput?: {
    name: string;
    args: Record<string, string>;
  };
  rawInput: string;
};

export type ContractStats = {
  totalTags: number;
  owner: string;
  contractAddress: string;
  network: string;
  chainId: number;
};

export type TransactionListResult = {
  transactions: DecodedTransaction[];
  totalCount: number;
  hasMore: boolean;
};

function getProvider() {
  return new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.RPC_URL);
}

function getContract() {
  const provider = getProvider();
  return new ethers.Contract(
    BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS,
    TAG_CONTRACT_ABI,
    provider
  );
}

/**
 * Get contract statistics
 */
export async function getContractStats(): Promise<ContractStats> {
  const contract = getContract();

  try {
    const [totalTags, owner] = await Promise.all([
      contract.totalTags(),
      contract.owner().catch(() => 'Unknown'),
    ]);

    return {
      totalTags: Number(totalTags),
      owner: owner as string,
      contractAddress: BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS,
      network: BLOCKCHAIN_CONFIG.NETWORK,
      chainId: BLOCKCHAIN_CONFIG.CHAIN_ID,
    };
  } catch (error) {
    console.error('Failed to get contract stats:', error);
    return {
      totalTags: 0,
      owner: 'Unknown',
      contractAddress: BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS,
      network: BLOCKCHAIN_CONFIG.NETWORK,
      chainId: BLOCKCHAIN_CONFIG.CHAIN_ID,
    };
  }
}

/**
 * Decode transaction input data using ABI
 */
export function decodeTransactionInput(
  input: string
): { name: string; args: Record<string, string> } | null {
  if (!input || input === '0x') return null;

  try {
    const iface = new ethers.Interface(TAG_CONTRACT_ABI);
    const decoded = iface.parseTransaction({ data: input });

    if (!decoded) return null;

    const args: Record<string, string> = {};
    decoded.fragment.inputs.forEach((param, index) => {
      const value = decoded.args[index];
      args[param.name] = formatDecodedValue(param.type, value);
    });

    return {
      name: decoded.name,
      args,
    };
  } catch {
    // Try manual decoding for known signatures
    const selector = input.slice(0, 10);
    const sig = FUNCTION_SIGNATURES[selector];
    if (sig) {
      return { name: sig.name, args: { raw: input.slice(10) } };
    }
    return null;
  }
}

/**
 * Format decoded value for display
 */
function formatDecodedValue(type: string, value: unknown): string {
  if (type === 'bytes32') {
    return String(value);
  }
  if (type === 'uint8') {
    const num = Number(value);
    const statusLabel = getChainStatusLabel(num);
    return `${num} (${statusLabel})`;
  }
  if (type === 'uint256') {
    return String(value);
  }
  if (type === 'address') {
    return String(value);
  }
  if (type === 'string') {
    return String(value);
  }
  if (type === 'bool') {
    return value ? 'true' : 'false';
  }
  return String(value);
}

/**
 * Get method name from input data
 */
export function getMethodName(input: string): string {
  if (!input || input === '0x') return 'Transfer';

  try {
    const iface = new ethers.Interface(TAG_CONTRACT_ABI);
    const decoded = iface.parseTransaction({ data: input });
    return decoded?.name || 'Unknown';
  } catch {
    const selector = input.slice(0, 10);
    return FUNCTION_SIGNATURES[selector]?.name || selector;
  }
}

/**
 * Fetch transactions for the contract from Etherscan V2 API
 */
export async function fetchContractTransactions(
  page: number = 1,
  pageSize: number = 25
): Promise<TransactionListResult> {
  // Etherscan V2 API - unified endpoint with chainid parameter
  const apiUrl = 'https://api.etherscan.io/v2/api';
  const contractAddress = BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS;
  const chainId = BLOCKCHAIN_CONFIG.CHAIN_ID;
  const apiKey = process.env.BASESCAN_API_KEY || '';

  try {
    // Fetch transactions from Etherscan V2 API
    const response = await fetch(
      `${apiUrl}?chainid=${chainId}&module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&page=${page}&offset=${pageSize}&sort=desc&apikey=${apiKey}`,
      { next: { revalidate: 30 } }
    );

    const data = await response.json();

    // Log for debugging
    console.log('BaseScan API response:', {
      status: data.status,
      message: data.message,
      resultCount: data.result?.length,
    });

    // BaseScan returns status '0' with 'NOTOK' when rate limited or error
    // But if we have results array, we should still use them
    if (
      !data.result ||
      !Array.isArray(data.result) ||
      data.result.length === 0
    ) {
      console.log('No transactions in result or invalid format');
      return { transactions: [], totalCount: 0, hasMore: false };
    }

    const transactions: DecodedTransaction[] = data.result.map(
      (tx: {
        hash: string;
        blockNumber: string;
        timeStamp: string;
        from: string;
        to: string;
        value: string;
        gasUsed: string;
        gasPrice: string;
        txreceipt_status: string;
        input: string;
        isError: string;
        methodId?: string;
        functionName?: string;
      }) => {
        const decoded = decodeTransactionInput(tx.input);
        // Use functionName from API if available, otherwise decode ourselves
        const methodName = tx.functionName
          ? tx.functionName.split('(')[0]
          : getMethodName(tx.input);

        return {
          hash: tx.hash,
          blockNumber: parseInt(tx.blockNumber),
          timestamp: parseInt(tx.timeStamp) * 1000,
          from: tx.from,
          to: tx.to,
          value: ethers.formatEther(tx.value),
          gasUsed: tx.gasUsed,
          gasPrice: ethers.formatUnits(tx.gasPrice, 'gwei'),
          status:
            tx.txreceipt_status === '1'
              ? 'success'
              : tx.isError === '1'
                ? 'failed'
                : 'pending',
          method: tx.methodId || tx.input.slice(0, 10),
          methodName,
          decodedInput: decoded || undefined,
          rawInput: tx.input,
        };
      }
    );

    return {
      transactions,
      totalCount: transactions.length,
      hasMore: transactions.length === pageSize,
    };
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return { transactions: [], totalCount: 0, hasMore: false };
  }
}

/**
 * Fetch a single transaction by hash
 */
export async function fetchTransaction(
  txHash: string
): Promise<DecodedTransaction | null> {
  const provider = getProvider();

  try {
    const [tx, receipt] = await Promise.all([
      provider.getTransaction(txHash),
      provider.getTransactionReceipt(txHash),
    ]);

    if (!tx) return null;

    const block = tx.blockNumber
      ? await provider.getBlock(tx.blockNumber)
      : null;
    const decoded = decodeTransactionInput(tx.data);
    const methodName = getMethodName(tx.data);

    return {
      hash: tx.hash,
      blockNumber: tx.blockNumber || 0,
      timestamp: block ? block.timestamp * 1000 : Date.now(),
      from: tx.from,
      to: tx.to || '',
      value: ethers.formatEther(tx.value),
      gasUsed: receipt ? receipt.gasUsed.toString() : '0',
      gasPrice: ethers.formatUnits(tx.gasPrice || 0, 'gwei'),
      status: receipt
        ? receipt.status === 1
          ? 'success'
          : 'failed'
        : 'pending',
      method: tx.data.slice(0, 10),
      methodName,
      decodedInput: decoded || undefined,
      rawInput: tx.data,
    };
  } catch (error) {
    console.error('Failed to fetch transaction:', error);
    return null;
  }
}

/**
 * Fetch contract events (TagCreated, TagStatusUpdated, TagRevoked)
 */
export async function fetchContractEvents(
  fromBlock: number = 0,
  toBlock: number | 'latest' = 'latest'
): Promise<
  Array<{
    event: string;
    blockNumber: number;
    transactionHash: string;
    args: Record<string, string>;
  }>
> {
  const contract = getContract();
  const provider = getProvider();

  try {
    const latestBlock =
      toBlock === 'latest' ? await provider.getBlockNumber() : toBlock;
    // Limit to last 10000 blocks to avoid timeout
    const startBlock = Math.max(fromBlock, latestBlock - 10000);

    const [createdEvents, statusEvents, revokedEvents] = await Promise.all([
      contract.queryFilter('TagCreated', startBlock, latestBlock),
      contract.queryFilter('TagStatusUpdated', startBlock, latestBlock),
      contract.queryFilter('TagRevoked', startBlock, latestBlock),
    ]);

    const allEvents = [
      ...createdEvents.map((e) => ({
        event: 'TagCreated',
        blockNumber: e.blockNumber,
        transactionHash: e.transactionHash,
        args: {
          tagId: (e as ethers.EventLog).args?.[0] || '',
          hash: (e as ethers.EventLog).args?.[1] || '',
          metadataURI: (e as ethers.EventLog).args?.[2] || '',
          timestamp: String((e as ethers.EventLog).args?.[3] || ''),
        },
      })),
      ...statusEvents.map((e) => ({
        event: 'TagStatusUpdated',
        blockNumber: e.blockNumber,
        transactionHash: e.transactionHash,
        args: {
          tagId: (e as ethers.EventLog).args?.[0] || '',
          oldStatus: getChainStatusLabel(
            Number((e as ethers.EventLog).args?.[1])
          ),
          newStatus: getChainStatusLabel(
            Number((e as ethers.EventLog).args?.[2])
          ),
          timestamp: String((e as ethers.EventLog).args?.[3] || ''),
        },
      })),
      ...revokedEvents.map((e) => ({
        event: 'TagRevoked',
        blockNumber: e.blockNumber,
        transactionHash: e.transactionHash,
        args: {
          tagId: (e as ethers.EventLog).args?.[0] || '',
          reason: (e as ethers.EventLog).args?.[1] || '',
          timestamp: String((e as ethers.EventLog).args?.[2] || ''),
        },
      })),
    ];

    // Sort by block number descending
    return allEvents.sort((a, b) => b.blockNumber - a.blockNumber);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return [];
  }
}

/**
 * Validate a tag on blockchain and return full details
 */
export async function getTagDetails(tagCode: string): Promise<{
  isValid: boolean;
  tagId: string;
  hash?: string;
  metadataURI?: string;
  status?: number;
  statusLabel?: string;
  createdAt?: Date;
} | null> {
  const contract = getContract();

  try {
    const tagId = ethers.keccak256(ethers.toUtf8Bytes(tagCode));
    const result = await contract.validateTag(tagId);

    return {
      isValid: result.isValid,
      tagId,
      hash: result.isValid ? result.hash : undefined,
      metadataURI: result.isValid ? result.metadataURI : undefined,
      status: result.isValid ? Number(result.status) : undefined,
      statusLabel: result.isValid
        ? getChainStatusLabel(Number(result.status))
        : undefined,
      createdAt: result.isValid
        ? new Date(Number(result.createdAt) * 1000)
        : undefined,
    };
  } catch (error) {
    console.error('Failed to get tag details:', error);
    return null;
  }
}
