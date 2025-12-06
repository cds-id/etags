'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { TagMetadata } from './types';

type TagMetadataCardProps = {
  metadata: TagMetadata;
  isStamped: boolean;
  onMetadataChange: (key: string, value: string) => void;
};

export function TagMetadataCard({
  metadata,
  isStamped,
  onMetadataChange,
}: TagMetadataCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Tambahan</CardTitle>
        <CardDescription>Metadata opsional untuk tag ini</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notes">Catatan</Label>
          <Textarea
            id="notes"
            value={metadata.notes || ''}
            onChange={(e) => onMetadataChange('notes', e.target.value)}
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
              onChange={(e) => onMetadataChange('batch_number', e.target.value)}
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
                onMetadataChange('manufacture_date', e.target.value)
              }
              disabled={isStamped}
            />
          </div>
        </div>

        <Separator className="my-4" />

        {/* Distribution Information */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Informasi Distribusi</h4>
            <p className="text-xs text-muted-foreground">
              Tentukan di mana tag ini akan didistribusikan (dicatat di
              blockchain)
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="distribution_region">Wilayah Distribusi</Label>
              <Input
                id="distribution_region"
                value={metadata.distribution_region || ''}
                onChange={(e) =>
                  onMetadataChange('distribution_region', e.target.value)
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
                  onMetadataChange('distribution_country', value)
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
              <Label htmlFor="distribution_channel">Kanal Distribusi</Label>
              <Select
                value={metadata.distribution_channel || ''}
                onValueChange={(value) =>
                  onMetadataChange('distribution_channel', value)
                }
                disabled={isStamped}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kanal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="official_store">Toko Resmi</SelectItem>
                  <SelectItem value="authorized_retailer">
                    Pengecer Resmi
                  </SelectItem>
                  <SelectItem value="online_marketplace">
                    Marketplace Online
                  </SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
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
                  onMetadataChange('intended_market', value)
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
                  <SelectItem value="southeast_asia">Asia Tenggara</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
