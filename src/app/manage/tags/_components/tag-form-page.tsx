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
            {isEdit ? 'Edit Tag' : 'Buat Tag'}
          </h2>
          <p className="text-muted-foreground">
            {isEdit
              ? isStamped
                ? 'Tag ini sudah dicap ke blockchain. Hanya status publikasi yang dapat diubah.'
                : `Mengedit tag ${tag?.code}`
              : 'Buat tag baru dan hubungkan dengan produk'}
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
                  <CardTitle>Informasi Tag</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Kode Tag</Label>
                    <Input value={tag?.code} disabled className="font-mono" />
                  </div>

                  {isStamped && (
                    <>
                      <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4">
                        <Lock className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-200">
                            Tercap di Blockchain
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Data inti tidak dapat diubah. Hanya status publikasi
                            yang dapat diubah.
                          </p>
                        </div>
                      </div>

                      {tag?.hash_tx && (
                        <div className="space-y-2">
                          <Label>Hash Transaksi</Label>
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
                        <Label>Status Chain</Label>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {getChainStatusLabel(tag?.chain_status ?? null)}
                          </Badge>
                          {isRevoked && (
                            <span className="text-xs text-destructive">
                              Tag telah dicabut
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Chain Status Management - only for stamped, non-revoked tags */}
                      {!isRevoked && (
                        <div className="space-y-3">
                          <Label>Perbarui Status Chain</Label>
                          <div className="flex gap-2">
                            <Select
                              value={String(tag?.chain_status ?? 0)}
                              onValueChange={(value) =>
                                handleStatusChange(parseInt(value))
                              }
                              disabled={isUpdatingStatus}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Pilih status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">Dibuat</SelectItem>
                                <SelectItem value="1">
                                  Didistribusikan
                                </SelectItem>
                                <SelectItem value="2">Diklaim</SelectItem>
                                <SelectItem value="3">Dipindahkan</SelectItem>
                                <SelectItem value="4">Ditandai</SelectItem>
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
                              Status berhasil diperbarui
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
                            Cabut Tag
                          </Button>
                          <p className="mt-2 text-xs text-muted-foreground text-center">
                            Mencabut akan membatalkan tag ini secara permanen di
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
                              Tag Dicabut
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                              Tag ini telah dicabut secara permanen dan tidak
                              dapat dipulihkan.
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
                    Sumber Daya Tag
                  </CardTitle>
                  <CardDescription>
                    Kode QR dan metadata yang dibuat saat pencapan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {/* QR Code Preview */}
                    <div className="space-y-3">
                      <Label>Kode QR</Label>
                      <div className="flex flex-col items-center gap-3 rounded-lg border bg-white p-4">
                        {qrCodeUrl && (
                          <Image
                            src={qrCodeUrl}
                            alt={`Kode QR untuk ${tag?.code}`}
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
                            Unduh QR
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
                            File metadata statis
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
                            Lihat Metadata
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Designed Tag Download */}
                  <div className="mt-6 pt-6 border-t">
                    <Label className="mb-3 block">
                      Tag Berdesain (dengan Template)
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center rounded-lg border p-4 bg-muted/30">
                      <div className="flex items-center gap-3 flex-1">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">
                            Unduh dengan Desain
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Kode QR ditempatkan di latar belakang template
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
                            Pratinjau
                          </a>
                        </Button>
                        <Button type="button" size="sm" asChild>
                          <a
                            href={`/api/tags/${tag?.code}/designed?download=true`}
                            download
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Unduh
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
                    Riwayat Pemindaian
                  </CardTitle>
                  <CardDescription>
                    Catatan semua pemindaian untuk tag ini
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
                        Total Pemindaian
                      </p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-2xl font-bold">
                        {tagScans.uniqueScanners}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Perangkat Unik
                      </p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {tagScans.firstHandCount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tangan Pertama
                      </p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {tagScans.secondHandCount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tangan Kedua
                      </p>
                    </div>
                  </div>

                  {/* Scan Timeline */}
                  {tagScans.scans.length === 0 ? (
                    <div className="py-8 text-center">
                      <History className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">
                        Belum ada pemindaian tercatat
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {tagScans.scans.map((scan) => (
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
                                      ? 'Tangan Pertama'
                                      : scan.isFirstHand === false
                                        ? 'Tangan Kedua'
                                        : 'Diklaim'}
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
                                  Perangkat:{' '}
                                  {scan.fingerprintId.substring(0, 16)}
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
                                  <span className="font-medium">Sumber:</span>{' '}
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
                  Pilih Produk
                </CardTitle>
                <CardDescription>
                  Pilih satu atau lebih produk untuk dihubungkan dengan tag ini.
                  {selectedProductIds.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedProductIds.length} dipilih
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="py-8 text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      Tidak ada produk aktif tersedia.
                    </p>
                    <Button asChild className="mt-4">
                      <Link href="/manage/products/new">Buat Produk</Link>
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
                <CardTitle>Informasi Tambahan</CardTitle>
                <CardDescription>
                  Metadata opsional untuk tag ini
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    value={metadata.notes || ''}
                    onChange={(e) =>
                      handleMetadataChange('notes', e.target.value)
                    }
                    placeholder="Catatan opsional tentang tag ini..."
                    rows={3}
                    disabled={isStamped}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="batch_number">Nomor Batch</Label>
                    <Input
                      id="batch_number"
                      value={metadata.batch_number || ''}
                      onChange={(e) =>
                        handleMetadataChange('batch_number', e.target.value)
                      }
                      placeholder="cth. BATCH-001"
                      disabled={isStamped}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manufacture_date">Tanggal Produksi</Label>
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

                <Separator className="my-4" />

                {/* Distribution Information */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium">
                      Informasi Distribusi
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Tentukan di mana tag ini akan didistribusikan (dicatat di
                      blockchain)
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="distribution_region">
                        Wilayah Distribusi
                      </Label>
                      <Input
                        id="distribution_region"
                        value={metadata.distribution_region || ''}
                        onChange={(e) =>
                          handleMetadataChange(
                            'distribution_region',
                            e.target.value
                          )
                        }
                        placeholder="cth. Jakarta, Jawa Barat, Indonesia"
                        disabled={isStamped}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="distribution_country">Kode Negara</Label>
                      <Select
                        value={metadata.distribution_country || ''}
                        onValueChange={(value) =>
                          handleMetadataChange('distribution_country', value)
                        }
                        disabled={isStamped}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih negara" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ID">Indonesia (ID)</SelectItem>
                          <SelectItem value="SG">Singapura (SG)</SelectItem>
                          <SelectItem value="MY">Malaysia (MY)</SelectItem>
                          <SelectItem value="TH">Thailand (TH)</SelectItem>
                          <SelectItem value="VN">Vietnam (VN)</SelectItem>
                          <SelectItem value="PH">Filipina (PH)</SelectItem>
                          <SelectItem value="GLOBAL">Global</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="distribution_channel">
                        Kanal Distribusi
                      </Label>
                      <Select
                        value={metadata.distribution_channel || ''}
                        onValueChange={(value) =>
                          handleMetadataChange('distribution_channel', value)
                        }
                        disabled={isStamped}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kanal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="official_store">
                            Toko Resmi
                          </SelectItem>
                          <SelectItem value="authorized_retailer">
                            Pengecer Resmi
                          </SelectItem>
                          <SelectItem value="online_marketplace">
                            Marketplace Online
                          </SelectItem>
                          <SelectItem value="distributor">
                            Distributor
                          </SelectItem>
                          <SelectItem value="direct_sales">
                            Penjualan Langsung
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="intended_market">Pasar Tujuan</Label>
                      <Select
                        value={metadata.intended_market || ''}
                        onValueChange={(value) =>
                          handleMetadataChange('intended_market', value)
                        }
                        disabled={isStamped}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih pasar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="domestic">Domestik</SelectItem>
                          <SelectItem value="export">Ekspor</SelectItem>
                          <SelectItem value="global">Global</SelectItem>
                          <SelectItem value="southeast_asia">
                            Asia Tenggara
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                    Pencapan Blockchain
                  </CardTitle>
                  <CardDescription>
                    Cap tag ini ke blockchain untuk verifikasi permanen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isPublished && (
                    <div className="flex items-start gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-950 p-3 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <p className="text-yellow-800 dark:text-yellow-200">
                        Tag harus <strong>dipublikasikan</strong> sebelum dicap
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
                        Memuat...
                      </>
                    ) : (
                      <>
                        <Stamp className="mr-2 h-4 w-4" />
                        Cap ke Blockchain
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Tindakan ini tidak dapat dibatalkan. Data tag akan dicatat
                    secara permanen di blockchain.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Publikasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="publish_status">Status Publikasi</Label>
                  {isStamped ? (
                    <>
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2 bg-muted">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {tag?.publish_status === 1 ? 'Dipublikasi' : 'Draf'}
                        </span>
                        <input
                          type="hidden"
                          name="publish_status"
                          value={String(tag?.publish_status ?? 0)}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Status publikasi terkunci setelah pencapan blockchain
                      </p>
                    </>
                  ) : (
                    <>
                      <Select
                        name="publish_status"
                        defaultValue={String(tag?.publish_status ?? 0)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Draf</SelectItem>
                          <SelectItem value="1">Dipublikasi</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Hanya tag yang dipublikasi yang dapat dipindai publik
                      </p>
                    </>
                  )}
                </div>

                {isEdit && (
                  <div className="space-y-2">
                    <Label>Status Blockchain</Label>
                    <div className="flex gap-2">
                      <Badge variant={isStamped ? 'default' : 'outline'}>
                        {isStamped ? 'Tercap' : 'Belum Tercap'}
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
                      ? 'Menyimpan...'
                      : isEdit
                        ? 'Perbarui Tag'
                        : 'Buat Tag'}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/manage/tags">Batal</Link>
                  </Button>
                </div>
                {selectedProductIds.length === 0 && !isStamped && (
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Pilih setidaknya satu produk untuk melanjutkan
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Selected Products Summary */}
            {selectedProductIds.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Produk Dipilih</CardTitle>
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
                              Hapus
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
              Konfirmasi Pencapan Blockchain
            </DialogTitle>
            <DialogDescription>
              Tinjau detail tag sebelum mencap ke blockchain. Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          {stampResult?.success ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-950 p-4">
                <Check className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Berhasil Dicap!
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Tag telah dicatat secara permanen di blockchain
                  </p>
                </div>
              </div>
              {stampResult.data && (
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Hash Transaksi:</strong>
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
                  Pencapan Gagal
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
                    Tidak Dapat Mencap Tag
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
                <h4 className="mb-3 font-medium">Detail Tag</h4>
                <dl className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Kode Tag</dt>
                    <dd className="font-mono">
                      {stampPreview.metadata.tag.code}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Produk</dt>
                    <dd>{stampPreview.metadata.products.length} produk</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">URL Verifikasi</dt>
                    <dd className="truncate max-w-[200px] font-mono text-xs">
                      {stampPreview.metadata.verification.verify_url}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="mb-3 font-medium">Produk yang Disertakan</h4>
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
                <p className="font-medium">Yang akan terjadi:</p>
                <ul className="mt-2 list-inside list-disc text-muted-foreground">
                  <li>Kode QR akan dibuat dan diunggah</li>
                  <li>JSON metadata statis akan dibuat</li>
                  <li>Tag akan dicatat di blockchain</li>
                  <li>Konten tag menjadi tidak dapat diubah</li>
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
                  Batal
                </Button>
                {stampPreview?.canStamp && (
                  <Button onClick={handleConfirmStamp} disabled={isStamping}>
                    {isStamping ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mencap...
                      </>
                    ) : (
                      <>
                        <Stamp className="mr-2 h-4 w-4" />
                        Konfirmasi & Cap
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
            {stampResult?.success && (
              <Button onClick={() => setShowStampDialog(false)}>Selesai</Button>
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
              Cabut Tag
            </DialogTitle>
            <DialogDescription>
              Ini akan membatalkan tag secara permanen di blockchain. Tindakan
              ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          {statusUpdateResult?.success ? (
            <div className="flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-950 p-4">
              <Check className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Tag Berhasil Dicabut
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Tag telah dibatalkan secara permanen di blockchain
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950 p-4">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-medium">Peringatan</p>
                  <ul className="mt-1 list-inside list-disc text-red-600 dark:text-red-400">
                    <li>Tag akan ditandai tidak valid di blockchain</li>
                    <li>
                      Pemindaian kode QR akan menampilkan status pencabutan
                    </li>
                    <li>Tindakan ini permanen dan tidak dapat dibatalkan</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="revoke_reason">
                  Alasan Pencabutan <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="revoke_reason"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="cth. Pemalsuan terdeteksi, Produk ditarik, Tag dikompromikan..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Alasan ini akan dicatat di blockchain
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
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmRevoke}
                  disabled={isUpdatingStatus || !revokeReason.trim()}
                >
                  {isUpdatingStatus ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mencabut...
                    </>
                  ) : (
                    <>
                      <Ban className="mr-2 h-4 w-4" />
                      Konfirmasi Pencabutan
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
                Selesai
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
