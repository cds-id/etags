'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, ChevronRight, Package } from 'lucide-react';
import { SupportHeader } from './support-header';
import { createSupportTicket } from '@/lib/actions/support-tickets';

interface Product {
  id: number;
  code: string;
  metadata: { name?: string; images?: string[] };
  brand: { id: number; name: string };
}

interface NFTProduct {
  id: number;
  tag: { id: number; code: string };
  products: Product[];
  image_url: string;
}

const CATEGORIES = [
  { value: 'defect', label: 'Cacat Produk' },
  { value: 'quality', label: 'Masalah Kualitas' },
  { value: 'missing_parts', label: 'Bagian Hilang' },
  { value: 'warranty', label: 'Klaim Garansi' },
  { value: 'other', label: 'Lainnya' },
];

interface NewTicketFormProps {
  walletAddress: string;
  nfts: NFTProduct[];
  onBack: () => void;
  onSuccess: () => void;
}

export function NewTicketForm({
  walletAddress,
  nfts,
  onBack,
  onSuccess,
}: NewTicketFormProps) {
  const [selectedNFT, setSelectedNFT] = useState<NFTProduct | null>(null);
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNFT || !walletAddress) return;

    setIsSubmitting(true);
    try {
      const result = await createSupportTicket({
        tagId: selectedNFT.tag.id,
        walletAddress,
        category,
        subject,
        description,
      });

      if (result.success) {
        toast.success(`Tiket dibuat: ${result.ticketNumber}`);
        onSuccess();
      } else {
        toast.error(result.error || 'Gagal membuat tiket');
      }
    } catch {
      toast.error('Gagal membuat tiket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#2B4C7E]/5 to-white">
      <SupportHeader walletAddress={walletAddress} />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 text-[#2B4C7E] hover:text-[#1E3A5F] hover:bg-[#2B4C7E]/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <Card className="border-[#A8A8A8]/20 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#2B4C7E]/5 to-transparent border-b border-[#A8A8A8]/10">
            <CardTitle className="text-xl text-[#0C2340]">
              Tiket Dukungan Baru
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {!selectedNFT ? (
              <div className="space-y-4">
                <p className="text-[#808080] text-sm">
                  Pilih produk untuk membuat tiket:
                </p>
                <div className="grid gap-3">
                  {nfts.map((nft) => (
                    <Card
                      key={nft.tag.id}
                      className="cursor-pointer border-[#A8A8A8]/20 hover:border-[#2B4C7E] hover:shadow-md transition-all group"
                      onClick={() => setSelectedNFT(nft)}
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        {nft.image_url && (
                          <img
                            src={nft.image_url}
                            alt="NFT"
                            className="w-16 h-16 rounded-xl object-cover ring-2 ring-[#A8A8A8]/20 group-hover:ring-[#2B4C7E]/40 transition-all"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#0C2340] truncate">
                            {nft.products[0]?.metadata?.name || nft.tag.code}
                          </p>
                          <p className="text-sm text-[#808080]">
                            {nft.products[0]?.brand?.name}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-[#A8A8A8] group-hover:text-[#2B4C7E] transition-colors" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {nfts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-[#A8A8A8]/10 flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-[#A8A8A8]" />
                    </div>
                    <p className="text-[#808080]">
                      Tidak ada produk ditemukan. Anda perlu memiliki NFT untuk
                      mengajukan tiket.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="p-4 bg-[#2B4C7E]/5 rounded-xl border border-[#2B4C7E]/10">
                  <p className="text-xs font-semibold text-[#2B4C7E] uppercase tracking-wider mb-1">
                    Produk Terpilih
                  </p>
                  <p className="font-medium text-[#0C2340]">
                    {selectedNFT.products[0]?.metadata?.name ||
                      selectedNFT.tag.code}
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-sm text-[#2B4C7E] hover:text-[#1E3A5F]"
                    onClick={() => setSelectedNFT(null)}
                  >
                    Ganti produk
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-[#0C2340]">
                    Kategori
                  </Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger
                      id="category"
                      className="border-[#A8A8A8]/30 focus:border-[#2B4C7E] focus:ring-[#2B4C7E]/20"
                    >
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-[#0C2340]">
                    Subjek
                  </Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Deskripsi singkat masalah"
                    required
                    className="border-[#A8A8A8]/30 focus:border-[#2B4C7E] focus:ring-[#2B4C7E]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#0C2340]">
                    Deskripsi
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Jelaskan masalah Anda secara detail..."
                    rows={5}
                    required
                    className="resize-none border-[#A8A8A8]/30 focus:border-[#2B4C7E] focus:ring-[#2B4C7E]/20"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#2B4C7E] hover:bg-[#1E3A5F] text-white rounded-full h-12 shadow-lg shadow-[#2B4C7E]/30"
                  disabled={
                    isSubmitting || !category || !subject || !description
                  }
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Tiket'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
