import type { TagMetadata, ProductMetadata } from '@/lib/product-templates';
import type { PreviewStampingResult, TagScansResult } from '@/lib/actions/tags';

export type Product = {
  id: number;
  code: string;
  metadata: unknown;
  brand: {
    id: number;
    name: string;
  };
};

export type Tag = {
  id: number;
  code: string;
  product_ids: unknown;
  metadata: unknown;
  publish_status: number;
  is_stamped: number;
  chain_status: number | null;
  hash_tx: string | null;
  products: Product[];
};

export type TagUrls = {
  metadataUrl: string;
  qrCodeUrl: string;
} | null;

export type StampResult = {
  success: boolean;
  error?: string;
  data?: { metadataUrl: string; qrCodeUrl: string; txHash: string };
} | null;

export type StatusUpdateResult = {
  success: boolean;
  error?: string;
} | null;

export { type TagMetadata, type ProductMetadata };
export { type PreviewStampingResult, type TagScansResult };
