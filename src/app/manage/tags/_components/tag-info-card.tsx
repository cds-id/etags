'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Lock, ExternalLink, Loader2, Ban } from 'lucide-react';
import { getChainStatusLabel, getTxExplorerUrl } from '@/lib/constants';
import type { Tag, StatusUpdateResult } from './types';

type TagInfoCardProps = {
  tag: Tag;
  isStamped: boolean;
  isRevoked: boolean;
  isUpdatingStatus: boolean;
  statusUpdateResult: StatusUpdateResult;
  onStatusChange: (newStatus: number) => void;
  onRevokeClick: () => void;
};

export function TagInfoCard({
  tag,
  isStamped,
  isRevoked,
  isUpdatingStatus,
  statusUpdateResult,
  onStatusChange,
  onRevokeClick,
}: TagInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Tag</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Kode Tag</Label>
          <Input value={tag.code} disabled className="font-mono" />
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
                  Data inti tidak dapat diubah. Hanya status publikasi yang
                  dapat diubah.
                </p>
              </div>
            </div>

            {tag.hash_tx && (
              <div className="space-y-2">
                <Label>Hash Transaksi</Label>
                <div className="flex gap-2">
                  <Input
                    value={tag.hash_tx}
                    disabled
                    className="font-mono text-xs"
                  />
                  <Button type="button" variant="outline" size="icon" asChild>
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
                  {getChainStatusLabel(tag.chain_status)}
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
                    value={String(tag.chain_status ?? 0)}
                    onValueChange={(value) => onStatusChange(parseInt(value))}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Dibuat</SelectItem>
                      <SelectItem value="1">Didistribusikan</SelectItem>
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
                  onClick={onRevokeClick}
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
                    Tag ini telah dicabut secara permanen dan tidak dapat
                    dipulihkan.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
