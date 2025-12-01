'use client';

import { useActionState, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  createTag,
  updateTag,
  stampTagToBlockchain,
  getStampingPreview,
  updateChainStatus,
  revokeTagOnBlockchain,
  type TagFormState,
  type PreviewStampingResult,
  type TagScansResult,
} from '@/lib/actions/tags';
import {
  getChainStatusLabel,
  CHAIN_STATUS,
  getTxExplorerUrl,
} from '@/lib/constants';
import type { ProductMetadata, TagMetadata } from '@/lib/product-templates';
import {
  ArrowLeft,
  Package,
  Check,
  Lock,
  Stamp,
  QrCode,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Ban,
  FileJson,
  Link as LinkIcon,
  Download,
  ImageIcon,
  History,
  Users,
  MapPin,
  Smartphone,
  Globe,
} from 'lucide-react';

type Product = {
  id: number;
  code: string;
  metadata: unknown;
  brand: {
    id: number;
    name: string;
  };
};

type Tag = {
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

type TagUrls = {
  metadataUrl: string;
  qrCodeUrl: string;
} | null;

type TagFormPageProps = {
  tag?: Tag | null;
  products: Product[];
  tagUrls?: TagUrls;
  tagScans?: TagScansResult | null;
};

export function TagFormPage({
  tag,
  products,
  tagUrls,
  tagScans,
}: TagFormPageProps) {
  const router = useRouter();
  const isEdit = !!tag;
  const isStamped = tag?.is_stamped === 1;
  const isPublished = tag?.publish_status === 1;

  const [selectedProductIds, setSelectedProductIds] = useState<number[]>(
    Array.isArray(tag?.product_ids) ? (tag.product_ids as number[]) : []
  );
  const [metadata, setMetadata] = useState<TagMetadata>(
    (tag?.metadata as TagMetadata) || {}
  );

  // Stamping state
  const [showStampDialog, setShowStampDialog] = useState(false);
  const [stampPreview, setStampPreview] =
    useState<PreviewStampingResult | null>(null);
  const [isLoadingPreview, startPreviewTransition] = useTransition();
  const [isStamping, startStampingTransition] = useTransition();
  const [stampResult, setStampResult] = useState<{
    success: boolean;
    error?: string;
    data?: { metadataUrl: string; qrCodeUrl: string; txHash: string };
  } | null>(null);

  // Chain status management state
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [isUpdatingStatus, startStatusTransition] = useTransition();
  const [statusUpdateResult, setStatusUpdateResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);

  const isRevoked = tag?.chain_status === CHAIN_STATUS.REVOKED;

  const boundAction = tag ? updateTag.bind(null, tag.id) : createTag;

  const [state, formAction, isPending] = useActionState<TagFormState, FormData>(
    boundAction,
    {}
  );

  if (state.success && !showStampDialog) {
    router.push('/manage/tags');
  }

  const handleProductToggle = (productId: number) => {
    if (isStamped) return;

    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleMetadataChange = (key: string, value: string) => {
    if (isStamped) return;
    setMetadata((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (formData: FormData) => {
    formData.set('product_ids', JSON.stringify(selectedProductIds));
    formData.set('metadata', JSON.stringify(metadata));
    formAction(formData);
  };

  const getProductName = (product: Product) => {
    return (product.metadata as ProductMetadata)?.name || product.code;
  };

  // Handle stamp button click
  const handleStampClick = () => {
    if (!tag) return;

    startPreviewTransition(async () => {
      const preview = await getStampingPreview(tag.id);
      setStampPreview(preview);
      setShowStampDialog(true);
    });
  };

  // Handle confirm stamping
  const handleConfirmStamp = () => {
    if (!tag) return;

    startStampingTransition(async () => {
      const result = await stampTagToBlockchain(tag.id);
      setStampResult({
        success: result.success ?? false,
        error: result.error,
        data: result.data,
      });

      if (result.success) {
        // Refresh the page after successful stamping
        setTimeout(() => {
          router.refresh();
          setShowStampDialog(false);
        }, 2000);
      }
    });
  };

  // Handle chain status update
  const handleStatusChange = (newStatus: number) => {
    if (!tag || isRevoked) return;

    startStatusTransition(async () => {
      const result = await updateChainStatus(
        tag.id,
        newStatus as 0 | 1 | 2 | 3 | 4 | 5
      );
      setStatusUpdateResult({
        success: result.success ?? false,
        error: result.error,
      });

      if (result.success) {
        router.refresh();
      }
    });
  };

  // Handle revoke tag
  const handleConfirmRevoke = () => {
    if (!tag || !revokeReason.trim()) return;

    startStatusTransition(async () => {
      const result = await revokeTagOnBlockchain(tag.id, revokeReason.trim());
      setStatusUpdateResult({
        success: result.success ?? false,
        error: result.error,
      });

      if (result.success) {
        setTimeout(() => {
          router.refresh();
          setShowRevokeDialog(false);
        }, 2000);
      }
    });
  };

  // Group products by brand
  const productsByBrand = products.reduce(
    (acc, product) => {
      const brandName = product.brand.name;
      if (!acc[brandName]) {
        acc[brandName] = [];
      }
      acc[brandName].push(product);
      return acc;
    },
    {} as Record<string, Product[]>
  );

  // Can stamp check
  const canStamp =
    isEdit && isPublished && !isStamped && selectedProductIds.length > 0;

  // Use server-provided URLs for stamped tags
  const qrCodeUrl = tagUrls?.qrCodeUrl || null;
  const metadataUrl = tagUrls?.metadataUrl || null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/manage/tags">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Edit Tag' : 'Create Tag'}
          </h2>
          <p className="text-muted-foreground">
            {isEdit
              ? isStamped
                ? 'This tag is stamped on blockchain. Only publish status can be changed.'
                : `Editing tag ${tag?.code}`
              : 'Create a new tag and link it to products'}
          </p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Tag Information */}
            {isEdit && (
              <Card>
                <CardHeader>
                  <CardTitle>Tag Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tag Code</Label>
                    <Input value={tag?.code} disabled className="font-mono" />
                  </div>

                  {isStamped && (
                    <>
                      <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4">
                        <Lock className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-200">
                            Blockchain Stamped
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Core data is immutable. Only publish status can be
                            changed.
                          </p>
                        </div>
                      </div>

                      {tag?.hash_tx && (
                        <div className="space-y-2">
                          <Label>Transaction Hash</Label>
                          <div className="flex gap-2">
                            <Input
                              value={tag.hash_tx}
                              disabled
                              className="font-mono text-xs"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              asChild
                            >
                              <a
                                href={getTxExplorerUrl(tag.hash_tx)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Chain Status</Label>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {getChainStatusLabel(tag?.chain_status ?? null)}
                          </Badge>
                          {isRevoked && (
                            <span className="text-xs text-destructive">
                              Tag has been revoked
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Chain Status Management - only for stamped, non-revoked tags */}
                      {!isRevoked && (
                        <div className="space-y-3">
                          <Label>Update Chain Status</Label>
                          <div className="flex gap-2">
                            <Select
                              value={String(tag?.chain_status ?? 0)}
                              onValueChange={(value) =>
                                handleStatusChange(parseInt(value))
                              }
                              disabled={isUpdatingStatus}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">Created</SelectItem>
                                <SelectItem value="1">Distributed</SelectItem>
                                <SelectItem value="2">Claimed</SelectItem>
                                <SelectItem value="3">Transferred</SelectItem>
                                <SelectItem value="4">Flagged</SelectItem>
                              </SelectContent>
                            </Select>
                            {isUpdatingStatus && (
                              <Loader2 className="h-4 w-4 animate-spin self-center" />
                            )}
                          </div>
                          {statusUpdateResult?.error && (
                            <p className="text-sm text-destructive">
                              {statusUpdateResult.error}
                            </p>
                          )}
                          {statusUpdateResult?.success && (
                            <p className="text-sm text-green-600">
                              Status updated successfully
                            </p>
                          )}
                        </div>
                      )}

                      {/* Revoke Button */}
                      {!isRevoked && (
                        <div className="pt-2">
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => setShowRevokeDialog(true)}
                            className="w-full"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Revoke Tag
                          </Button>
                          <p className="mt-2 text-xs text-muted-foreground text-center">
                            Revoking will permanently invalidate this tag on the
                            blockchain
                          </p>
                        </div>
                      )}

                      {/* Revoked Warning */}
                      {isRevoked && (
                        <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4">
                          <Ban className="h-5 w-5 text-red-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-red-800 dark:text-red-200">
                              Tag Revoked
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                              This tag has been permanently revoked and cannot
                              be restored.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Stamped Tag Resources */}
            {isStamped && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Tag Resources
                  </CardTitle>
                  <CardDescription>
                    QR code and metadata generated during stamping
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {/* QR Code Preview */}
                    <div className="space-y-3">
                      <Label>QR Code</Label>
                      <div className="flex flex-col items-center gap-3 rounded-lg border bg-white p-4">
                        {qrCodeUrl && (
                          <Image
                            src={qrCodeUrl}
                            alt={`QR Code for ${tag?.code}`}
                            width={160}
                            height={160}
                            className="rounded"
                          />
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={qrCodeUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <QrCode className="mr-2 h-4 w-4" />
                            Download QR
                          </a>
                        </Button>
                      </div>
                    </div>

                    {/* Metadata Link */}
                    <div className="space-y-3">
                      <Label>Metadata JSON</Label>
                      <div className="space-y-3 rounded-lg border p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <FileJson className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Static metadata file
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground break-all font-mono">
                          {metadataUrl}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={metadataUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <LinkIcon className="mr-2 h-4 w-4" />
                            View Metadata
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Designed Tag Download */}
                  <div className="mt-6 pt-6 border-t">
                    <Label className="mb-3 block">
                      Designed Tag (with Template)
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center rounded-lg border p-4 bg-muted/30">
                      <div className="flex items-center gap-3 flex-1">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">
                            Download with Design
                          </p>
                          <p className="text-xs text-muted-foreground">
                            QR code placed on template background
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={`/api/tags/${tag?.code}/designed`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Preview
                          </a>
                        </Button>
                        <Button type="button" size="sm" asChild>
                          <a
                            href={`/api/tags/${tag?.code}/designed?download=true`}
                            download
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Scan History */}
            {isStamped && tagScans && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Scan History
                  </CardTitle>
                  <CardDescription>
                    Record of all scans for this tag
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Stats Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-2xl font-bold">
                        {tagScans.totalScans}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total Scans
                      </p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-2xl font-bold">
                        {tagScans.uniqueScanners}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Unique Devices
                      </p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {tagScans.firstHandCount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        First Hand
                      </p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {tagScans.secondHandCount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Second Hand
                      </p>
                    </div>
                  </div>

                  {/* Scan Timeline */}
                  {tagScans.scans.length === 0 ? (
                    <div className="py-8 text-center">
                      <History className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">
                        No scans recorded yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {tagScans.scans.map((scan, index) => (
                        <div
                          key={scan.id}
                          className="relative border-l-2 border-gray-200 pl-4 pb-4 last:pb-0"
                        >
                          {/* Timeline dot */}
                          <div
                            className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white ${
                              scan.isFirstHand === true
                                ? 'bg-green-500'
                                : scan.isFirstHand === false
                                  ? 'bg-orange-500'
                                  : 'bg-gray-400'
                            }`}
                          />

                          <div className="rounded-lg border bg-card p-3">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="font-mono text-xs"
                                >
                                  #{scan.scanNumber}
                                </Badge>
                                {scan.isClaimed && (
                                  <Badge
                                    variant={
                                      scan.isFirstHand ? 'default' : 'secondary'
                                    }
                                  >
                                    {scan.isFirstHand === true
                                      ? 'First Hand'
                                      : scan.isFirstHand === false
                                        ? 'Second Hand'
                                        : 'Claimed'}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(scan.createdAt).toLocaleString(
                                  'id-ID'
                                )}
                              </span>
                            </div>

                            {/* Details */}
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Smartphone className="h-3 w-3" />
                                <span
                                  className="truncate text-xs"
                                  title={scan.fingerprintId}
                                >
                                  Device: {scan.fingerprintId.substring(0, 16)}
                                  ...
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Globe className="h-3 w-3" />
                                <span className="text-xs">
                                  IP: {scan.ipAddress}
                                </span>
                              </div>
                              {scan.locationName && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span
                                    className="truncate text-xs"
                                    title={scan.locationName}
                                  >
                                    {scan.locationName.length > 50
                                      ? scan.locationName.substring(0, 50) +
                                        '...'
                                      : scan.locationName}
                                  </span>
                                </div>
                              )}
                              {scan.sourceInfo && (
                                <div className="mt-2 rounded bg-muted p-2 text-xs">
                                  <span className="font-medium">Source:</span>{' '}
                                  {scan.sourceInfo}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Product Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Select Products
                </CardTitle>
                <CardDescription>
                  Choose one or more products to link with this tag.
                  {selectedProductIds.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedProductIds.length} selected
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="py-8 text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      No active products available.
                    </p>
                    <Button asChild className="mt-4">
                      <Link href="/manage/products/new">Create Product</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(productsByBrand).map(
                      ([brandName, brandProducts]) => (
                        <div key={brandName}>
                          <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                            {brandName}
                          </h4>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {brandProducts.map((product) => {
                              const isSelected = selectedProductIds.includes(
                                product.id
                              );
                              return (
                                <label
                                  key={product.id}
                                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                                    isSelected
                                      ? 'border-primary bg-primary/5'
                                      : 'hover:bg-muted/50'
                                  } ${isStamped ? 'cursor-not-allowed opacity-60' : ''}`}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() =>
                                      handleProductToggle(product.id)
                                    }
                                    disabled={isStamped}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">
                                      {getProductName(product)}
                                    </p>
                                    <p className="font-mono text-xs text-muted-foreground">
                                      {product.code}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                                  )}
                                </label>
                              );
                            })}
                          </div>
                          <Separator className="mt-4" />
                        </div>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tag Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>
                  Optional metadata for this tag
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={metadata.notes || ''}
                    onChange={(e) =>
                      handleMetadataChange('notes', e.target.value)
                    }
                    placeholder="Optional notes about this tag..."
                    rows={3}
                    disabled={isStamped}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="batch_number">Batch Number</Label>
                    <Input
                      id="batch_number"
                      value={metadata.batch_number || ''}
                      onChange={(e) =>
                        handleMetadataChange('batch_number', e.target.value)
                      }
                      placeholder="e.g., BATCH-001"
                      disabled={isStamped}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manufacture_date">Manufacture Date</Label>
                    <Input
                      id="manufacture_date"
                      type="date"
                      value={metadata.manufacture_date || ''}
                      onChange={(e) =>
                        handleMetadataChange('manufacture_date', e.target.value)
                      }
                      disabled={isStamped}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Blockchain Stamping */}
            {isEdit && !isStamped && (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stamp className="h-5 w-5" />
                    Blockchain Stamping
                  </CardTitle>
                  <CardDescription>
                    Stamp this tag to blockchain for permanent verification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isPublished && (
                    <div className="flex items-start gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-950 p-3 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <p className="text-yellow-800 dark:text-yellow-200">
                        Tag must be <strong>published</strong> before stamping
                      </p>
                    </div>
                  )}
                  <Button
                    type="button"
                    onClick={handleStampClick}
                    disabled={!canStamp || isLoadingPreview}
                    className="w-full"
                    variant={canStamp ? 'default' : 'secondary'}
                  >
                    {isLoadingPreview ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Stamp className="mr-2 h-4 w-4" />
                        Stamp to Blockchain
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    This action is irreversible. The tag data will be
                    permanently recorded on the blockchain.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Publish Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="publish_status">Publish Status</Label>
                  {isStamped ? (
                    <>
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2 bg-muted">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {tag?.publish_status === 1 ? 'Published' : 'Draft'}
                        </span>
                        <input
                          type="hidden"
                          name="publish_status"
                          value={String(tag?.publish_status ?? 0)}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Publish status is locked after blockchain stamping
                      </p>
                    </>
                  ) : (
                    <>
                      <Select
                        name="publish_status"
                        defaultValue={String(tag?.publish_status ?? 0)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Draft</SelectItem>
                          <SelectItem value="1">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Only published tags are visible for public scanning
                      </p>
                    </>
                  )}
                </div>

                {isEdit && (
                  <div className="space-y-2">
                    <Label>Blockchain Status</Label>
                    <div className="flex gap-2">
                      <Badge variant={isStamped ? 'default' : 'outline'}>
                        {isStamped ? 'Stamped' : 'Not Stamped'}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                {state.error && (
                  <p className="mb-4 text-sm text-destructive">{state.error}</p>
                )}
                <div className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    disabled={isPending || selectedProductIds.length === 0}
                    className="w-full"
                  >
                    {isPending
                      ? 'Saving...'
                      : isEdit
                        ? 'Update Tag'
                        : 'Create Tag'}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/manage/tags">Cancel</Link>
                  </Button>
                </div>
                {selectedProductIds.length === 0 && !isStamped && (
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Select at least one product to continue
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Selected Products Summary */}
            {selectedProductIds.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Selected Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedProductIds.map((id) => {
                      const product = products.find((p) => p.id === id);
                      if (!product) return null;
                      return (
                        <li
                          key={id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="truncate">
                            {getProductName(product)}
                          </span>
                          {!isStamped && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleProductToggle(id)}
                              className="h-6 px-2 text-muted-foreground hover:text-destructive"
                            >
                              Remove
                            </Button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>

      {/* Stamping Confirmation Dialog */}
      <Dialog open={showStampDialog} onOpenChange={setShowStampDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stamp className="h-5 w-5" />
              Confirm Blockchain Stamping
            </DialogTitle>
            <DialogDescription>
              Review the tag details before stamping to blockchain. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {stampResult?.success ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-950 p-4">
                <Check className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Successfully Stamped!
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Tag has been permanently recorded on blockchain
                  </p>
                </div>
              </div>
              {stampResult.data && (
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Transaction Hash:</strong>
                  </p>
                  <code className="block rounded bg-muted p-2 text-xs break-all">
                    {stampResult.data.txHash}
                  </code>
                </div>
              )}
            </div>
          ) : stampResult?.error ? (
            <div className="flex items-center gap-3 rounded-lg bg-red-50 dark:bg-red-950 p-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">
                  Stamping Failed
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {stampResult.error}
                </p>
              </div>
            </div>
          ) : stampPreview?.canStamp === false ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Cannot Stamp Tag
                  </p>
                  <ul className="mt-2 list-inside list-disc text-sm text-yellow-700 dark:text-yellow-300">
                    {stampPreview.reasons?.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : stampPreview?.metadata ? (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="mb-3 font-medium">Tag Details</h4>
                <dl className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Tag Code</dt>
                    <dd className="font-mono">
                      {stampPreview.metadata.tag.code}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Products</dt>
                    <dd>{stampPreview.metadata.products.length} product(s)</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Verify URL</dt>
                    <dd className="truncate max-w-[200px] font-mono text-xs">
                      {stampPreview.metadata.verification.verify_url}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="mb-3 font-medium">Products to Include</h4>
                <ul className="space-y-2">
                  {stampPreview.metadata.products.map((product) => (
                    <li
                      key={product.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{product.name}</span>
                      <span className="text-muted-foreground">
                        {product.brand.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium">What will happen:</p>
                <ul className="mt-2 list-inside list-disc text-muted-foreground">
                  <li>QR code will be generated and uploaded</li>
                  <li>Static metadata JSON will be created</li>
                  <li>Tag will be recorded on blockchain</li>
                  <li>Tag content will become immutable</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          <DialogFooter>
            {!stampResult?.success && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowStampDialog(false);
                    setStampResult(null);
                  }}
                  disabled={isStamping}
                >
                  Cancel
                </Button>
                {stampPreview?.canStamp && (
                  <Button onClick={handleConfirmStamp} disabled={isStamping}>
                    {isStamping ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Stamping...
                      </>
                    ) : (
                      <>
                        <Stamp className="mr-2 h-4 w-4" />
                        Confirm & Stamp
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
            {stampResult?.success && (
              <Button onClick={() => setShowStampDialog(false)}>Done</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Ban className="h-5 w-5" />
              Revoke Tag
            </DialogTitle>
            <DialogDescription>
              This will permanently invalidate the tag on the blockchain. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {statusUpdateResult?.success ? (
            <div className="flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-950 p-4">
              <Check className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Tag Revoked Successfully
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  The tag has been permanently invalidated on the blockchain
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950 p-4">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-medium">Warning</p>
                  <ul className="mt-1 list-inside list-disc text-red-600 dark:text-red-400">
                    <li>The tag will be marked as invalid on blockchain</li>
                    <li>QR code scans will show revocation status</li>
                    <li>This action is permanent and irreversible</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="revoke_reason">
                  Reason for Revocation{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="revoke_reason"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g., Counterfeit detected, Product recalled, Tag compromised..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  This reason will be recorded on the blockchain
                </p>
              </div>

              {statusUpdateResult?.error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950 p-3">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {statusUpdateResult.error}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {!statusUpdateResult?.success && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRevokeDialog(false);
                    setRevokeReason('');
                    setStatusUpdateResult(null);
                  }}
                  disabled={isUpdatingStatus}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmRevoke}
                  disabled={isUpdatingStatus || !revokeReason.trim()}
                >
                  {isUpdatingStatus ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Revoking...
                    </>
                  ) : (
                    <>
                      <Ban className="mr-2 h-4 w-4" />
                      Confirm Revoke
                    </>
                  )}
                </Button>
              </>
            )}
            {statusUpdateResult?.success && (
              <Button
                onClick={() => {
                  setShowRevokeDialog(false);
                  setRevokeReason('');
                  setStatusUpdateResult(null);
                }}
              >
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
