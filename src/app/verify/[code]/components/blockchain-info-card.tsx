'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hash, ExternalLink, FileJson, Link as LinkIcon } from 'lucide-react';

const BASESCAN_URL = 'https://sepolia.basescan.org';

type BlockchainInfoCardProps = {
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

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('id-ID', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function BlockchainInfoCard({
  blockchainMetadata,
}: BlockchainInfoCardProps) {
  return (
    <Card className="mb-6 border-0 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent shadow-lg shadow-indigo-500/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <CardHeader className="pb-3 relative">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Hash className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">Data Blockchain</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm ml-10">
          Informasi yang tercatat di blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border border-indigo-100 dark:border-indigo-900">
            <p className="text-xs text-muted-foreground">Network</p>
            <p className="font-medium text-sm sm:text-base text-indigo-700 dark:text-indigo-300">
              {blockchainMetadata.network}
            </p>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border border-indigo-100 dark:border-indigo-900">
            <p className="text-xs text-muted-foreground">Waktu Stamp</p>
            <p className="font-medium text-xs sm:text-sm text-indigo-700 dark:text-indigo-300">
              {formatTime(blockchainMetadata.stampedAt)}
            </p>
          </div>
        </div>

        {blockchainMetadata.transactionHash && (
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border border-indigo-100 dark:border-indigo-900">
            <p className="text-xs text-muted-foreground mb-1">
              Transaction Hash
            </p>
            <div className="flex items-center gap-2">
              <code className="text-[10px] sm:text-xs font-mono text-slate-700 dark:text-slate-300 truncate flex-1 min-w-0">
                {blockchainMetadata.transactionHash}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 shrink-0 hover:bg-indigo-100 hover:text-indigo-700"
                asChild
              >
                <a
                  href={`${BASESCAN_URL}/tx/${blockchainMetadata.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        )}

        <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border border-indigo-100 dark:border-indigo-900">
          <p className="text-xs text-muted-foreground mb-1">Contract Address</p>
          <div className="flex items-center gap-2">
            <code className="text-[10px] sm:text-xs font-mono text-slate-700 dark:text-slate-300 truncate flex-1 min-w-0">
              {blockchainMetadata.contractAddress}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 shrink-0 hover:bg-indigo-100 hover:text-indigo-700"
              asChild
            >
              <a
                href={`${BASESCAN_URL}/address/${blockchainMetadata.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700"
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
            className="flex-1 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700"
            asChild
          >
            <a
              href={blockchainMetadata.qrCodeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              QR Code
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
