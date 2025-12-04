'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  QrCode,
  FileJson,
  Link as LinkIcon,
  Download,
  ImageIcon,
} from 'lucide-react';
import type { Tag, TagUrls } from './types';

type TagResourcesCardProps = {
  tag: Tag;
  tagUrls: TagUrls;
};

export function TagResourcesCard({ tag, tagUrls }: TagResourcesCardProps) {
  const qrCodeUrl = tagUrls?.qrCodeUrl || null;
  const metadataUrl = tagUrls?.metadataUrl || null;

  return (
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
                  alt={`Kode QR untuk ${tag.code}`}
                  width={160}
                  height={160}
                  className="rounded"
                />
              )}
              <Button type="button" variant="outline" size="sm" asChild>
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
              <Button type="button" variant="outline" size="sm" asChild>
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
          <Label className="mb-3 block">Tag Berdesain (dengan Template)</Label>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center gap-3 flex-1">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Unduh dengan Desain</p>
                <p className="text-xs text-muted-foreground">
                  Kode QR ditempatkan di latar belakang template
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button type="button" variant="outline" size="sm" asChild>
                <a
                  href={`/api/tags/${tag.code}/designed`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Pratinjau
                </a>
              </Button>
              <Button type="button" size="sm" asChild>
                <a
                  href={`/api/tags/${tag.code}/designed?download=true`}
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
  );
}
