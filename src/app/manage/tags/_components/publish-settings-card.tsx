'use client';

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
import { Lock } from 'lucide-react';
import type { Tag } from './types';

type PublishSettingsCardProps = {
  tag?: Tag | null;
  isEdit: boolean;
  isStamped: boolean;
};

export function PublishSettingsCard({
  tag,
  isEdit,
  isStamped,
}: PublishSettingsCardProps) {
  return (
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
  );
}
