'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Wallet,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import {
  useWeb3,
  formatAddress,
  getTxUrl,
  SUPPORTED_CHAIN,
} from '@/hooks/useWeb3';
import type { ClaimNFTResponse } from '@/app/api/scan/claim-nft/route';

interface NFTClaimCardProps {
  tagCode: string;
  fingerprintId: string;
  isFirstHand: boolean;
  isStamped: boolean;
  existingNFT?: {
    tokenId: string;
    imageUrl: string;
    ownerAddress: string;
  } | null;
  csrfToken: string;
}

type ClaimStep =
  | 'idle'
  | 'connecting'
  | 'switching-network'
  | 'generating'
  | 'minting'
  | 'success'
  | 'error';

export function NFTClaimCard({
  tagCode,
  fingerprintId,
  isFirstHand,
  isStamped,
  existingNFT,
  csrfToken,
}: NFTClaimCardProps) {
  const {
    isWeb3Available,
    isConnected,
    isConnecting,
    account,
    isCorrectNetwork,
    error: web3Error,
    connect,
    switchNetwork,
  } = useWeb3();

  const [step, setStep] = useState<ClaimStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [nftResult, setNftResult] = useState<ClaimNFTResponse['nft'] | null>(
    null
  );

  // Check NFT availability on mount
  const [nftAvailable, setNftAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const response = await fetch(`/api/scan/claim-nft?tagCode=${tagCode}`);
        const data = await response.json();
        setNftAvailable(data.nftAvailable);
        if (data.nft) {
          setNftResult({
            tokenId: data.nft.tokenId,
            imageUrl: data.nft.imageUrl,
            metadataUrl: '',
            mintTxHash: '',
          });
        }
      } catch (err) {
        console.error('Failed to check NFT availability:', err);
      }
    };

    if (isStamped && isFirstHand) {
      checkAvailability();
    }
  }, [tagCode, isStamped, isFirstHand]);

  // Handle the full claim flow
  const handleClaimNFT = useCallback(async () => {
    setError(null);

    // Step 1: Connect wallet if not connected
    if (!isConnected) {
      setStep('connecting');
      const connectedAccount = await connect();
      if (!connectedAccount) {
        setStep('error');
        setError('Gagal terhubung ke wallet');
        return;
      }
    }

    // Step 2: Switch network if needed
    if (!isCorrectNetwork) {
      setStep('switching-network');
      const switched = await switchNetwork();
      if (!switched) {
        setStep('error');
        setError(`Gagal beralih ke jaringan ${SUPPORTED_CHAIN.name}`);
        return;
      }
    }

    // Step 3: Generate art and mint
    setStep('generating');

    try {
      // Call the API to claim NFT
      setStep('minting');

      const response = await fetch('/api/scan/claim-nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          tagCode,
          fingerprintId,
          walletAddress: account,
        }),
      });

      const result: ClaimNFTResponse = await response.json();

      if (result.success && result.nft) {
        setNftResult(result.nft);
        setStep('success');
        setNftAvailable(false);
      } else {
        setStep('error');
        setError(result.error || 'Gagal mint NFT');
      }
    } catch (err) {
      setStep('error');
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  }, [
    isConnected,
    isCorrectNetwork,
    connect,
    switchNetwork,
    tagCode,
    fingerprintId,
    account,
    csrfToken,
  ]);

  // Don't show if not first-hand or not stamped
  if (!isFirstHand || !isStamped) {
    return null;
  }

  // Show existing NFT if already minted
  if (existingNFT || (nftResult && step !== 'success')) {
    const nft = existingNFT || nftResult;
    const ownerAddr =
      existingNFT?.ownerAddress || nftResult?.ownerAddress || account || '';
    return (
      <Card className="mb-6 border-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent shadow-xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-500" />
            NFT Collectible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {nft?.imageUrl && (
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <img
                  src={nft.imageUrl}
                  alt="NFT"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                NFT sudah di-mint
              </p>
              <p className="font-mono text-sm">Token #{nft?.tokenId}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Owner: {formatAddress(ownerAddr)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show success state
  if (step === 'success' && nftResult) {
    return (
      <Card className="mb-6 border-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent shadow-xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg text-green-700">
            <CheckCircle className="h-5 w-5" />
            NFT Berhasil Di-mint!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            {nftResult.imageUrl && (
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex-shrink-0">
                <img
                  src={nftResult.imageUrl}
                  alt="Your NFT"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <p className="font-medium">Token #{nftResult.tokenId}</p>
              <p className="text-sm text-muted-foreground">
                NFT Collectible Anda telah dikirim ke wallet:
              </p>
              <p className="font-mono text-sm">
                {formatAddress(account || '')}
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                {nftResult.mintTxHash && (
                  <a
                    href={getTxUrl(nftResult.mintTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    Lihat Transaksi
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {nftResult.imageUrl && (
                  <a
                    href={nftResult.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline"
                  >
                    Lihat Gambar
                    <ImageIcon className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show claim button or progress
  return (
    <Card className="mb-6 border-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Klaim NFT Collectible
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        {/* Not Web3 available */}
        {!isWeb3Available && (
          <div className="text-center py-4">
            <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Web3 wallet tidak terdeteksi
            </p>
            <p className="text-xs text-muted-foreground">
              Install MetaMask atau wallet Web3 lainnya untuk klaim NFT
            </p>
          </div>
        )}

        {/* Web3 available - show claim flow */}
        {isWeb3Available && nftAvailable && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sebagai pemilik pertama (first-hand), Anda berhak mendapatkan NFT
              Collectible eksklusif sebagai bukti kepemilikan di blockchain.
            </p>

            {/* Progress indicator */}
            {step !== 'idle' && step !== 'error' && (
              <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg">
                <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                <span className="text-sm">
                  {step === 'connecting' && 'Menghubungkan wallet...'}
                  {step === 'switching-network' &&
                    `Beralih ke ${SUPPORTED_CHAIN.name}...`}
                  {step === 'generating' && 'Membuat artwork NFT...'}
                  {step === 'minting' && 'Minting NFT ke blockchain...'}
                </span>
              </div>
            )}

            {/* Error state */}
            {(step === 'error' || error || web3Error) && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error || web3Error}</span>
              </div>
            )}

            {/* Connected account info */}
            {isConnected && account && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Terhubung:</span>
                <span className="font-mono">{formatAddress(account)}</span>
                {!isCorrectNetwork && (
                  <span className="text-orange-600 text-xs">
                    (Network salah)
                  </span>
                )}
              </div>
            )}

            {/* Claim button */}
            <Button
              onClick={handleClaimNFT}
              disabled={step !== 'idle' && step !== 'error' && !isConnecting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {!isConnected ? (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Hubungkan Wallet & Klaim NFT
                </>
              ) : !isCorrectNetwork ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Ganti Network & Klaim NFT
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Klaim NFT Collectible
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Gas fee dibayar oleh platform. Anda tidak perlu membayar apapun.
            </p>
          </div>
        )}

        {/* NFT not available (already claimed or not eligible) */}
        {isWeb3Available && nftAvailable === false && !nftResult && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              NFT untuk tag ini sudah di-claim atau tidak tersedia.
            </p>
          </div>
        )}

        {/* Loading state */}
        {isWeb3Available && nftAvailable === null && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
