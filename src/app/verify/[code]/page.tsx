'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, XCircle } from 'lucide-react';
import type { VerifyResponse } from '@/app/api/verify/route';

import {
  VerifyHeader,
  VerifyStatusCard,
  FraudAnalysisCard,
  ProductInfoCard,
  DistributionInfoCard,
  ScanStatisticsCard,
  ScanHistoryCard,
  BlockchainInfoCard,
  InfoCard,
} from './components';

export default function VerifyPage() {
  const params = useParams();
  const code = params.code as string;

  const [data, setData] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude?: number;
    longitude?: number;
    locationName?: string;
  }>({});

  // Get user's current location for AI analysis
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let locationName: string | undefined;

          // Try to reverse geocode the location
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            if (response.ok) {
              const geoData = await response.json();
              locationName = geoData.display_name;
            }
          } catch (e) {
            console.log('Reverse geocoding failed:', e);
          }

          setUserLocation({ latitude, longitude, locationName });
        },
        (err) => {
          console.log('Geolocation error:', err.message);
          // Continue without location - AI will use scan history instead
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    }
  }, []);

  const fetchVerification = useCallback(async () => {
    if (!code) return;

    setLoading(true);
    setError(null);

    try {
      // Build URL with location parameters for AI analysis
      const urlParams = new URLSearchParams({ code });
      if (userLocation.latitude) {
        urlParams.set('lat', userLocation.latitude.toString());
      }
      if (userLocation.longitude) {
        urlParams.set('lon', userLocation.longitude.toString());
      }
      if (userLocation.locationName) {
        urlParams.set('location', userLocation.locationName);
      }

      const response = await fetch(`/api/verify?${urlParams.toString()}`);
      const result: VerifyResponse = await response.json();

      if (result.success) {
        setData(result);
      } else {
        setError(result.error || 'Gagal memverifikasi tag');
        setData(result);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Gagal memuat data verifikasi');
    } finally {
      setLoading(false);
    }
  }, [code, userLocation]);

  useEffect(() => {
    fetchVerification();
  }, [fetchVerification]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl animate-pulse" />
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30">
              <RefreshCw className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-white" />
            </div>
          </div>
          <p className="text-base sm:text-lg text-white/80 font-medium">
            Memverifikasi tag...
          </p>
          <p className="text-xs sm:text-sm text-white/50 mt-2">
            Mengecek blockchain dan menganalisis keamanan
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-violet-900/20 overflow-x-hidden">
      {/* Header */}
      <VerifyHeader
        code={code}
        loading={loading}
        onRefresh={fetchVerification}
      />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Error State */}
        {error && !data?.tag && (
          <Card className="mb-6 border-0 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent shadow-xl shadow-red-500/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <CardContent className="p-6 sm:p-8 text-center relative">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/30">
                <XCircle className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-red-700 mb-2">
                Tag Tidak Ditemukan
              </h2>
              <p className="text-sm sm:text-base text-red-600/80 mb-4">
                {error}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Pastikan kode tag yang Anda masukkan benar atau hubungi penjual
                untuk konfirmasi.
              </p>
            </CardContent>
          </Card>
        )}

        {data?.tag && (
          <>
            {/* Main Status Card */}
            <VerifyStatusCard
              isRevoked={data.tag.isRevoked}
              isStamped={data.tag.isStamped}
              chainStatusLabel={data.tag.chainStatusLabel}
            />

            {/* Fraud Analysis Card */}
            <FraudAnalysisCard
              fraudAnalysis={data.fraudAnalysis}
              aiAnalysis={data.aiAnalysis}
            />

            {/* Product Info */}
            <ProductInfoCard products={data.tag.products} />

            {/* Distribution Info */}
            <DistributionInfoCard distribution={data.tag.distribution} />

            {/* Scan Statistics */}
            <ScanStatisticsCard scanStats={data.scanStats} />

            {/* Scan History */}
            <ScanHistoryCard scanHistory={data.scanHistory} />

            {/* Blockchain Info */}
            {data.blockchainMetadata && (
              <BlockchainInfoCard
                blockchainMetadata={data.blockchainMetadata}
              />
            )}

            {/* Info Card */}
            <InfoCard />
          </>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 py-4">
          <p>Powered by Etags Blockchain Verification</p>
          <Link href="/scan" className="text-blue-600 hover:underline">
            Scan Tag Lain
          </Link>
        </div>
      </div>
    </div>
  );
}
