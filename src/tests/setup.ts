import { vi } from 'vitest';
import {
  mockPrismaClient,
  mockAuth,
  mockSignIn,
  mockSignOut,
  mockUploadFile,
  mockDeleteFile,
  mockRevalidatePath,
  mockBcrypt,
} from './mocks';

// Mock @/lib/db
vi.mock('@/lib/db', () => ({
  prisma: mockPrismaClient,
}));

// Mock @/lib/auth
vi.mock('@/lib/auth', () => ({
  auth: mockAuth,
  signIn: mockSignIn,
  signOut: mockSignOut,
}));

// Mock @/lib/r2
vi.mock('@/lib/r2', () => ({
  uploadFile: mockUploadFile,
  deleteFile: mockDeleteFile,
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}));

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: mockBcrypt,
  hash: mockBcrypt.hash,
  compare: mockBcrypt.compare,
}));

// Mock tag-sync
vi.mock('@/lib/tag-sync', () => ({
  updateTagChainStatus: vi.fn().mockResolvedValue({ success: true }),
  revokeTagOnChain: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock tag-stamping
vi.mock('@/lib/tag-stamping', () => ({
  stampTag: vi.fn().mockResolvedValue({
    success: true,
    data: {
      metadataUrl: 'https://example.com/metadata',
      qrCodeUrl: 'https://example.com/qr',
      txHash: '0x123',
    },
  }),
  previewTagStamping: vi.fn().mockResolvedValue({
    success: true,
    metadata: { tag_code: 'TAG-123' },
  }),
  getTagMetadataUrl: vi.fn().mockReturnValue('https://example.com/metadata'),
  getTagQRCodeUrl: vi.fn().mockReturnValue('https://example.com/qr'),
}));

// Mock next-auth AuthError
class MockAuthError extends Error {
  type: string;
  constructor(type: string) {
    super(type);
    this.type = type;
    this.name = 'AuthError';
  }
}

vi.mock('next-auth', () => ({
  AuthError: MockAuthError,
}));

// Global test setup
beforeEach(() => {
  vi.clearAllMocks();
});
