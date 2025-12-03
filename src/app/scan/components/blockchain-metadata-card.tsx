'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileJson, Hash, Link as LinkIcon } from 'lucide-react';

type BlockchainMetadataCardProps = {
  blockchainMetadata: {
    stampedAt: string;
    transactionHash: string | null;
    network: string;
    chainId: number;
    contractAddress: string;
    metadataUrl: string;
    qrCodeUrl: string;
    verifyUrl: string;
  };
};

export function BlockchainMetadataCard({
  blockchainMetadata,
}: BlockchainMetadataCardProps) {
  return (
    <Card className="mb-6 border-2 border-[#2B4C7E]/20 bg-linear-to-br from-[#2B4C7E]/10 via-[#2B4C7E]/5 to-transparent shadow-lg shadow-[#2B4C7E]/10 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#2B4C7E]/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <CardHeader className="pb-3 relative">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-[#2B4C7E] to-[#1E3A5F] flex items-center justify-center shadow-md shadow-[#2B4C7E]/20">
            <Hash className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-[#0C2340]">Data Blockchain</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm ml-10 text-[#808080]">
          Informasi yang tercatat di blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white/80 rounded-xl p-3 border border-[#2B4C7E]/20">
            <p className="text-xs text-[#808080]">Network</p>
            <p className="font-medium text-sm sm:text-base text-[#2B4C7E]">
              {blockchainMetadata.network}
            </p>
          </div>
          <div className="bg-white/80 rounded-xl p-3 border border-[#2B4C7E]/20">
            <p className="text-xs text-[#808080]">Waktu Stamp</p>
            <p className="font-medium text-xs sm:text-sm text-[#2B4C7E]">
              {new Date(blockchainMetadata.stampedAt).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Transaction Hash */}
        {blockchainMetadata.transactionHash && (
          <div className="bg-white/80 rounded-xl p-3 border border-[#2B4C7E]/20">
            <p className="text-xs text-[#808080] mb-1">Transaction Hash</p>
            <div className="flex items-center gap-2">
              <code className="text-[10px] sm:text-xs font-mono text-[#0C2340] truncate flex-1 min-w-0">
                {blockchainMetadata.transactionHash}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 shrink-0 hover:bg-[#2B4C7E]/10 hover:text-[#2B4C7E]"
                asChild
              >
                <a
                  href={`https://sepolia.basescan.org/tx/${blockchainMetadata.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Contract Address */}
        <div className="bg-white/80 rounded-xl p-3 border border-[#2B4C7E]/20">
          <p className="text-xs text-[#808080] mb-1">Contract Address</p>
          <div className="flex items-center gap-2">
            <code className="text-[10px] sm:text-xs font-mono text-[#0C2340] truncate flex-1 min-w-0">
              {blockchainMetadata.contractAddress}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 shrink-0 hover:bg-[#2B4C7E]/10 hover:text-[#2B4C7E]"
              asChild
            >
              <a
                href={`https://sepolia.basescan.org/address/${blockchainMetadata.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-[#2B4C7E]/30 hover:bg-[#2B4C7E]/10 hover:border-[#2B4C7E]/50 hover:text-[#2B4C7E]"
            asChild
          >
            <a
              href={blockchainMetadata.metadataUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileJson className="mr-2 h-4 w-4" />
              Metadata
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-[#2B4C7E]/30 hover:bg-[#2B4C7E]/10 hover:border-[#2B4C7E]/50 hover:text-[#2B4C7E]"
            asChild
          >
            <a
              href={blockchainMetadata.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              Verify URL
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
