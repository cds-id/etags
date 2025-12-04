'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  AlertCircle,
  Calendar,
  CheckCircle,
  User,
  Wallet,
  Tag,
  Package,
} from 'lucide-react';
import { TicketFull, Product, CATEGORY_LABELS, PRIORITY_CONFIG } from './types';

interface TicketDetailsSidebarProps {
  ticket: TicketFull;
}

export function TicketDetailsSidebar({ ticket }: TicketDetailsSidebarProps) {
  const priorityConfig =
    PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.normal;

  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle className="text-base text-gray-900">Detail Tiket</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Kategori</p>
            <p className="text-sm font-medium text-gray-900">
              {CATEGORY_LABELS[ticket.category] || ticket.category}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Prioritas</p>
            <p
              className={`text-sm font-medium capitalize ${priorityConfig.textColor}`}
            >
              <span
                className={`inline-block w-2 h-2 rounded-full ${priorityConfig.dotColor} mr-1.5`}
              />
              {priorityConfig.label}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Dibuat</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(ticket.created_at).toLocaleString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {ticket.resolved_at && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Diselesaikan</p>
              <p className="text-sm font-medium text-emerald-600">
                {new Date(ticket.resolved_at).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        )}

        {ticket.assignee && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Ditugaskan Ke</p>
              <p className="text-sm font-medium text-gray-900">
                {ticket.assignee.name}
              </p>
              <p className="text-xs text-gray-500">{ticket.assignee.email}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CustomerSidebarProps {
  walletAddress: string;
}

export function CustomerSidebar({ walletAddress }: CustomerSidebarProps) {
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle className="text-base text-gray-900">Pelanggan</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5 text-gray-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 mb-1">Alamat Wallet</p>
            <p className="font-mono text-xs text-gray-900 break-all bg-gray-50 p-2 rounded-lg">
              {walletAddress}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProductSidebarProps {
  tag: TicketFull['tag'];
  products: Product[];
}

export function ProductSidebar({ tag, products }: ProductSidebarProps) {
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle className="text-base text-gray-900">Produk</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Kode Tag</p>
            <p className="font-mono text-sm text-gray-900">{tag.code}</p>
          </div>
        </div>

        {tag.nft?.image_url && (
          <div>
            <p className="text-xs text-gray-500 mb-2">NFT Collectible</p>
            <div className="relative rounded-xl overflow-hidden border border-gray-100">
              <img
                src={tag.nft.image_url}
                alt="NFT"
                className="w-full aspect-square object-cover"
              />
            </div>
          </div>
        )}

        {products.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Produk Terkait</p>
            <div className="space-y-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                >
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {(product.metadata as { name?: string })?.name ||
                      product.code}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
