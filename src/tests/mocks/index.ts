import { vi } from 'vitest';

// Mock Prisma client
export const mockPrismaClient = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  brand: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  product: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  tag: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  tagScan: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
};

// Mock auth function
export const mockAuth = vi.fn();

// Mock signIn function
export const mockSignIn = vi.fn();

// Mock signOut function
export const mockSignOut = vi.fn();

// Mock R2 functions
export const mockUploadFile = vi.fn();
export const mockDeleteFile = vi.fn();

// Mock revalidatePath
export const mockRevalidatePath = vi.fn();

// Mock bcrypt
export const mockBcrypt = {
  hash: vi.fn(),
  compare: vi.fn(),
};

// Helper to create mock session
export function createMockSession(
  overrides: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
  } = {}
) {
  return {
    user: {
      id: overrides.id ?? '1',
      email: overrides.email ?? 'admin@example.com',
      name: overrides.name ?? 'Admin User',
      role: overrides.role ?? 'admin',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

// Helper to create mock FormData
export function createMockFormData(
  data: Record<string, string | File>
): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value);
  }
  return formData;
}

// Helper to create mock File
export function createMockFile(
  content: string = 'test content',
  name: string = 'test.png',
  type: string = 'image/png'
): File {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

// Reset all mocks
export function resetAllMocks() {
  vi.clearAllMocks();
}
