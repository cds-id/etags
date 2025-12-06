'use client';

import { useActionState, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import {
  createTag,
  updateTag,
  stampTagToBlockchain,
  getStampingPreview,
  updateChainStatus,
  revokeTagOnBlockchain,
  type TagFormState,
} from '@/lib/actions/tags';
import { CHAIN_STATUS } from '@/lib/constants';
import type { TagMetadata } from '@/lib/product-templates';
import type {
  Tag,
  Product,
  TagUrls,
  TagScansResult,
  PreviewStampingResult,
  StampResult,
  StatusUpdateResult,
} from './types';

import { TagInfoCard } from './tag-info-card';
import { TagResourcesCard } from './tag-resources-card';
import { ScanHistoryCard } from './scan-history-card';
import { ProductSelectionCard } from './product-selection-card';
import { TagMetadataCard } from './tag-metadata-card';
import { StampingCard } from './stamping-card';
import { PublishSettingsCard } from './publish-settings-card';
import { StampingDialog } from './stamping-dialog';
import { RevokeDialog } from './revoke-dialog';

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
  const isRevoked = tag?.chain_status === CHAIN_STATUS.REVOKED;

  // Form state
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
  const [stampResult, setStampResult] = useState<StampResult>(null);

  // Revoke state
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [isUpdatingStatus, startStatusTransition] = useTransition();
  const [statusUpdateResult, setStatusUpdateResult] =
    useState<StatusUpdateResult>(null);

  // Form action
  const boundAction = tag ? updateTag.bind(null, tag.id) : createTag;
  const [state, formAction, isPending] = useActionState<TagFormState, FormData>(
    boundAction,
    {}
  );

  if (state.success && !showStampDialog) {
    router.push('/manage/tags');
  }

  // Handlers
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

  const handleStampClick = () => {
    if (!tag) return;
    startPreviewTransition(async () => {
      const preview = await getStampingPreview(tag.id);
      setStampPreview(preview);
      setShowStampDialog(true);
    });
  };

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
        setTimeout(() => {
          router.refresh();
          setShowStampDialog(false);
        }, 2000);
      }
    });
  };

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

  const canStamp =
    isEdit && isPublished && !isStamped && selectedProductIds.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
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
            {isEdit && tag && (
              <TagInfoCard
                tag={tag}
                isStamped={isStamped}
                isRevoked={isRevoked}
                isUpdatingStatus={isUpdatingStatus}
                statusUpdateResult={statusUpdateResult}
                onStatusChange={handleStatusChange}
                onRevokeClick={() => setShowRevokeDialog(true)}
              />
            )}

            {isStamped && tag && (
              <TagResourcesCard tag={tag} tagUrls={tagUrls ?? null} />
            )}

            {isStamped && tagScans && <ScanHistoryCard tagScans={tagScans} />}

            <ProductSelectionCard
              products={products}
              selectedProductIds={selectedProductIds}
              isStamped={isStamped}
              onProductToggle={handleProductToggle}
            />

            <TagMetadataCard
              metadata={metadata}
              isStamped={isStamped}
              onMetadataChange={handleMetadataChange}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {isEdit && !isStamped && (
              <StampingCard
                isPublished={isPublished}
                canStamp={canStamp}
                isLoadingPreview={isLoadingPreview}
                onStampClick={handleStampClick}
              />
            )}

            <PublishSettingsCard
              tag={tag}
              isEdit={isEdit}
              isStamped={isStamped}
            />

            {/* Actions Card */}
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
                <CardContent className="pt-6">
                  <h3 className="text-sm font-medium mb-3">Produk Dipilih</h3>
                  <ul className="space-y-2">
                    {selectedProductIds.map((id) => {
                      const product = products.find((p) => p.id === id);
                      if (!product) return null;
                      const productName =
                        (product.metadata as { name?: string })?.name ||
                        product.code;
                      return (
                        <li
                          key={id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="truncate">{productName}</span>
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

      {/* Dialogs */}
      <StampingDialog
        open={showStampDialog}
        onOpenChange={setShowStampDialog}
        stampPreview={stampPreview}
        stampResult={stampResult}
        isStamping={isStamping}
        onConfirmStamp={handleConfirmStamp}
        onReset={() => setStampResult(null)}
      />

      <RevokeDialog
        open={showRevokeDialog}
        onOpenChange={setShowRevokeDialog}
        revokeReason={revokeReason}
        onRevokeReasonChange={setRevokeReason}
        statusUpdateResult={statusUpdateResult}
        isUpdatingStatus={isUpdatingStatus}
        onConfirmRevoke={handleConfirmRevoke}
        onReset={() => setStatusUpdateResult(null)}
      />
    </div>
  );
}
