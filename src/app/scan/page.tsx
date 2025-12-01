'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Html5Qrcode } from 'html5-qrcode';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Package,
  Shield,
  RefreshCw,
  ShieldCheck,
  Info,
  AlertTriangle,
  ShieldAlert,
  ShieldX,
  Link as LinkIcon,
  ExternalLink,
  Hash,
  FileJson,
} from 'lucide-react';
import type { ScanResponse } from '@/app/api/scan/route';
import type { ClaimResponse } from '@/app/api/scan/claim/route';

// Human-readable labels for constants
const COUNTRY_LABELS: Record<string, string> = {
  ID: 'Indonesia',
  SG: 'Singapura',
  MY: 'Malaysia',
  TH: 'Thailand',
  VN: 'Vietnam',
  PH: 'Filipina',
  GLOBAL: 'Global (Seluruh Dunia)',
};

const CHANNEL_LABELS: Record<string, string> = {
  official_store: 'Toko Resmi',
  authorized_retailer: 'Retailer Resmi',
  online_marketplace: 'Marketplace Online',
  distributor: 'Distributor',
  direct_sales: 'Penjualan Langsung',
};

const MARKET_LABELS: Record<string, string> = {
  domestic: 'Domestik',
  export: 'Ekspor',
  global: 'Global',
  southeast_asia: 'Asia Tenggara',
};

// Helper to get human-readable label
const getCountryLabel = (code?: string) =>
  code ? COUNTRY_LABELS[code] || code : undefined;
const getChannelLabel = (code?: string) =>
  code ? CHANNEL_LABELS[code] || code : undefined;
const getMarketLabel = (code?: string) =>
  code ? MARKET_LABELS[code] || code : undefined;

type LocationData = {
  latitude: number;
  longitude: number;
  locationName?: string;
};

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [fingerprintId, setFingerprintId] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<string | null>(null);

  // Initialize fingerprint and CSRF token
  useEffect(() => {
    const init = async () => {
      // Get CSRF token
      try {
        const csrfResponse = await fetch('/api/csrf');
        const csrfData = await csrfResponse.json();
        setCsrfToken(csrfData.token);
      } catch (err) {
        console.error('CSRF token error:', err);
      }

      // Get fingerprint
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setFingerprintId(result.visitorId);
      } catch (err) {
        console.error('Fingerprint error:', err);
        // Use fallback ID
        setFingerprintId(
          `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        );
      }
    };
    init();
  }, []);

  // Request GPS location
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }

    setLocationRequested(true);
    setShowLocationDialog(true);
  }, []);

  const confirmLocationAccess = useCallback(() => {
    setShowLocationDialog(false);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let locationName: string | undefined;

        // Try to reverse geocode
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          locationName = data.display_name;
        } catch {
          // Ignore geocoding errors
        }

        setLocation({ latitude, longitude, locationName });
      },
      (err) => {
        console.error('Location error:', err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const skipLocationAccess = useCallback(() => {
    setShowLocationDialog(false);
    setLocationDenied(true);
  }, []);

  // Process scanned code
  const processScan = useCallback(
    async (tagCode: string) => {
      if (!fingerprintId || loading) return;
      if (lastScannedRef.current === tagCode) return; // Prevent duplicate scans

      lastScannedRef.current = tagCode;
      setLoading(true);
      setError(null);
      setScanResult(null);
      setClaimSuccess(null);

      // Request location on scan
      if (!locationRequested) {
        requestLocation();
      }

      try {
        const response = await fetch('/api/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken || '',
          },
          body: JSON.stringify({
            tagCode,
            fingerprintId,
            latitude: location?.latitude,
            longitude: location?.longitude,
            locationName: location?.locationName,
          }),
        });

        const data: ScanResponse = await response.json();
        setScanResult(data);

        if (!data.success) {
          setError(data.error || 'Terjadi kesalahan');
        }
      } catch (err) {
        console.error('Scan error:', err);
        setError('Gagal memproses scan. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    },
    [
      fingerprintId,
      csrfToken,
      loading,
      location,
      locationRequested,
      requestLocation,
    ]
  );

  // Start scanner
  const startScanner = useCallback(async () => {
    if (!fingerprintId) return;

    setScanning(true);
    setError(null);
    setScanResult(null);
    lastScannedRef.current = null;

    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Stop scanner and process
          html5QrCode.stop().catch(console.error);
          setScanning(false);
          processScan(decodedText);
        },
        () => {
          // Ignore scan failures
        }
      );
    } catch (err) {
      console.error('Scanner error:', err);
      setError('Gagal memulai kamera. Pastikan izin kamera telah diberikan.');
      setScanning(false);
    }
  }, [fingerprintId, processScan]);

  // Stop scanner
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // Ignore stop errors
      }
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  // Handle claim answer
  const handleClaim = async (isFirstHand: boolean, sourceInfo?: string) => {
    if (!scanResult?.tag || !fingerprintId) return;

    setClaimLoading(true);
    try {
      const response = await fetch('/api/scan/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || '',
        },
        body: JSON.stringify({
          tagCode: scanResult.tag.code,
          fingerprintId,
          isFirstHand,
          sourceInfo,
          latitude: location?.latitude,
          longitude: location?.longitude,
          locationName: location?.locationName,
        }),
      });

      const data: ClaimResponse = await response.json();
      if (data.success) {
        setClaimSuccess(data.message);
        // Update scan result to hide question
        setScanResult((prev) =>
          prev
            ? { ...prev, question: { type: 'no_question', message: '' } }
            : null
        );
      } else {
        setError(data.error || 'Gagal mencatat klaim');
      }
    } catch (err) {
      console.error('Claim error:', err);
      setError('Gagal mencatat jawaban. Silakan coba lagi.');
    } finally {
      setClaimLoading(false);
    }
  };

  // Reset and scan again
  const resetScan = () => {
    setScanResult(null);
    setError(null);
    setClaimSuccess(null);
    lastScannedRef.current = null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Scan Tag Produk</h1>
          <p className="text-sm text-gray-600">
            Verifikasi keaslian produk Anda
          </p>
        </div>

        {/* Scanner Card */}
        {!scanResult && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div
                id="qr-reader"
                className={`overflow-hidden rounded-lg bg-black ${scanning ? 'min-h-[300px]' : 'hidden'}`}
              />

              {!scanning && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Camera className="mb-4 h-16 w-16 text-gray-400" />
                  <p className="mb-4 text-center text-gray-600">
                    Arahkan kamera ke QR code pada tag produk
                  </p>
                  <Button
                    onClick={startScanner}
                    disabled={!fingerprintId}
                    size="lg"
                    className="gap-2"
                  >
                    <Camera className="h-5 w-5" />
                    Mulai Scan
                  </Button>
                </div>
              )}

              {scanning && (
                <Button
                  onClick={stopScanner}
                  variant="outline"
                  className="mt-4 w-full"
                >
                  Batal
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <Card className="mb-4">
            <CardContent className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-600">Memproses scan...</span>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Scan Result */}
        {scanResult && (
          <>
            {/* Revoked Warning Card - Show prominently if tag is revoked */}
            {scanResult.isRevoked && (
              <Card className="mb-4 border-red-500 bg-red-100">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <ShieldX className="h-12 w-12 text-red-600" />
                    <div>
                      <CardTitle className="text-red-800 text-xl">
                        TAG DICABUT (REVOKED)
                      </CardTitle>
                      <CardDescription className="text-red-700">
                        Tag ini telah dicabut dari blockchain
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-red-200 p-4 text-red-900">
                    <p className="font-medium mb-2">⚠️ Peringatan Keamanan:</p>
                    <p className="text-sm">
                      {scanResult.blockchainValidation?.revokedMessage ||
                        'Tag ini telah dicabut (revoked) dari blockchain. Produk dengan tag ini mungkin palsu, dicuri, atau tidak sah. Jangan membeli atau menggunakan produk ini.'}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-red-700">
                    <Shield className="h-4 w-4" />
                    <span>Kode: {scanResult.tag?.code}</span>
                    {scanResult.tag?.chainStatusLabel && (
                      <Badge variant="destructive" className="ml-2">
                        {scanResult.tag.chainStatusLabel}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Validity Card - Show if not revoked */}
            {!scanResult.isRevoked && (
              <Card
                className={`mb-4 ${scanResult.valid ? 'border-green-200' : 'border-red-200'}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    {scanResult.valid ? (
                      <CheckCircle2 className="h-10 w-10 text-green-500" />
                    ) : (
                      <XCircle className="h-10 w-10 text-red-500" />
                    )}
                    <div>
                      <CardTitle
                        className={
                          scanResult.valid ? 'text-green-700' : 'text-red-700'
                        }
                      >
                        {scanResult.valid
                          ? 'Produk Terverifikasi'
                          : 'Produk Tidak Terverifikasi'}
                      </CardTitle>
                      <CardDescription>
                        {scanResult.valid
                          ? 'Tag ini telah terdaftar di blockchain'
                          : 'Tag ini belum terdaftar atau tidak valid'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>Kode: {scanResult.tag?.code}</span>
                    {scanResult.tag?.chainStatusLabel && (
                      <Badge variant="secondary" className="ml-2">
                        {scanResult.tag.chainStatusLabel}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Blockchain Metadata */}
            {scanResult.blockchainMetadata && (
              <Card className="mb-4 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Hash className="h-5 w-5 text-blue-600" />
                    Data Blockchain
                  </CardTitle>
                  <CardDescription>
                    Informasi yang tercatat di blockchain
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Stamped Date */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Waktu Stamp:</span>
                    <span className="font-medium">
                      {new Date(
                        scanResult.blockchainMetadata.stampedAt
                      ).toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Network */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Network:</span>
                    <span className="font-medium">
                      {scanResult.blockchainMetadata.network} (Chain ID:{' '}
                      {scanResult.blockchainMetadata.chainId})
                    </span>
                  </div>

                  {/* Transaction Hash */}
                  {scanResult.blockchainMetadata.transactionHash && (
                    <div className="space-y-1">
                      <span className="text-sm text-gray-500">
                        Transaction Hash:
                      </span>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded bg-gray-100 px-2 py-1 text-xs font-mono truncate">
                          {scanResult.blockchainMetadata.transactionHash}
                        </code>
                        <a
                          href={`https://sepolia.basescan.org/tx/${scanResult.blockchainMetadata.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Contract Address */}
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500">Contract:</span>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-gray-100 px-2 py-1 text-xs font-mono truncate">
                        {scanResult.blockchainMetadata.contractAddress}
                      </code>
                      <a
                        href={`https://sepolia.basescan.org/address/${scanResult.blockchainMetadata.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <a
                        href={scanResult.blockchainMetadata.metadataUrl}
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
                      asChild
                      className="flex-1"
                    >
                      <a
                        href={scanResult.blockchainMetadata.verifyUrl}
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
            )}

            {/* Product Info */}
            {scanResult.tag?.products && scanResult.tag.products.length > 0 && (
              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5" />
                    Informasi Produk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {scanResult.tag.products.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 border-b py-3 last:border-0"
                    >
                      {product.brandLogo && (
                        <Image
                          src={product.brandLogo}
                          alt={product.brand}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-lg object-contain"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.brand}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Scan Info */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total Scan</p>
                    <p className="text-xl font-bold">
                      {scanResult.scanInfo.totalScans}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Scan ke-</p>
                    <p className="text-xl font-bold">
                      {scanResult.scanInfo.scanNumber}
                    </p>
                  </div>
                </div>
                {location && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">
                      {location.locationName ||
                        `${location.latitude}, ${location.longitude}`}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fraud Detection Warning */}
            {scanResult.fraudAnalysis &&
              scanResult.fraudAnalysis.isSuspicious && (
                <Card
                  className={`mb-4 ${
                    scanResult.fraudAnalysis.riskLevel === 'critical'
                      ? 'border-red-500 bg-red-50'
                      : scanResult.fraudAnalysis.riskLevel === 'high'
                        ? 'border-orange-500 bg-orange-50'
                        : scanResult.fraudAnalysis.riskLevel === 'medium'
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle
                      className={`flex items-center gap-2 text-lg ${
                        scanResult.fraudAnalysis.riskLevel === 'critical'
                          ? 'text-red-800'
                          : scanResult.fraudAnalysis.riskLevel === 'high'
                            ? 'text-orange-800'
                            : scanResult.fraudAnalysis.riskLevel === 'medium'
                              ? 'text-yellow-800'
                              : 'text-gray-800'
                      }`}
                    >
                      {scanResult.fraudAnalysis.riskLevel === 'critical' ? (
                        <ShieldX className="h-5 w-5" />
                      ) : scanResult.fraudAnalysis.riskLevel === 'high' ? (
                        <ShieldAlert className="h-5 w-5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5" />
                      )}
                      {scanResult.fraudAnalysis.riskLevel === 'critical'
                        ? 'Peringatan Kritis!'
                        : scanResult.fraudAnalysis.riskLevel === 'high'
                          ? 'Risiko Tinggi!'
                          : 'Perhatian!'}
                    </CardTitle>
                    <CardDescription>
                      Skor Risiko: {scanResult.fraudAnalysis.riskScore}/100
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Risk reasons */}
                    {scanResult.fraudAnalysis.reasons.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-1">Alasan:</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {scanResult.fraudAnalysis.reasons.map(
                            (reason, idx) => (
                              <li key={idx} className="text-gray-700">
                                {reason}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Recommendation */}
                    <div className="rounded-lg bg-white/50 p-3 text-sm">
                      <p className="font-medium">Rekomendasi:</p>
                      <p className="text-gray-700">
                        {scanResult.fraudAnalysis.recommendation}
                      </p>
                    </div>

                    {/* Distribution info comparison */}
                    {scanResult.tag?.distribution && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-500 mb-2">
                          Informasi Distribusi Resmi:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {scanResult.tag.distribution.region && (
                            <div>
                              <span className="text-gray-500">Wilayah:</span>{' '}
                              <span className="font-medium">
                                {scanResult.tag.distribution.region}
                              </span>
                            </div>
                          )}
                          {scanResult.tag.distribution.country && (
                            <div>
                              <span className="text-gray-500">Negara:</span>{' '}
                              <span className="font-medium">
                                {getCountryLabel(
                                  scanResult.tag.distribution.country
                                )}
                              </span>
                            </div>
                          )}
                          {scanResult.tag.distribution.channel && (
                            <div>
                              <span className="text-gray-500">Channel:</span>{' '}
                              <span className="font-medium">
                                {getChannelLabel(
                                  scanResult.tag.distribution.channel
                                )}
                              </span>
                            </div>
                          )}
                          {scanResult.tag.distribution.intendedMarket && (
                            <div>
                              <span className="text-gray-500">Pasar:</span>{' '}
                              <span className="font-medium">
                                {getMarketLabel(
                                  scanResult.tag.distribution.intendedMarket
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

            {/* Low Risk / Safe Indicator */}
            {scanResult.fraudAnalysis &&
              !scanResult.fraudAnalysis.isSuspicious && (
                <Card className="mb-4 border-green-200 bg-green-50">
                  <CardContent className="flex items-center gap-3 p-4">
                    <ShieldCheck className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="font-medium text-green-800">
                        Lokasi Sesuai
                      </p>
                      <p className="text-sm text-green-600">
                        Lokasi scan sesuai dengan wilayah distribusi resmi
                        produk.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Warning when location is denied - fraud detection unavailable */}
            {locationDenied && !location && (
              <Card className="mb-4 border-orange-300 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="h-6 w-6 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-orange-800">
                        Deteksi Penipuan Tidak Tersedia
                      </p>
                      <p className="text-sm text-orange-700 mt-1">
                        Tanpa izin lokasi, sistem tidak dapat mendeteksi apakah
                        tag ini:
                      </p>
                      <ul className="text-sm text-orange-700 mt-2 space-y-1 list-disc list-inside">
                        <li>
                          Dipindai di luar wilayah distribusi resmi (grey
                          market)
                        </li>
                        <li>Diduplikasi atau dipalsukan</li>
                        <li>Memiliki pola pemindaian mencurigakan</li>
                      </ul>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 border-orange-400 text-orange-800 hover:bg-orange-200"
                        onClick={() => {
                          setLocationDenied(false);
                          setShowLocationDialog(true);
                        }}
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Izinkan Lokasi Sekarang
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Claim Success */}
            {claimSuccess && (
              <Card className="mb-4 border-green-200 bg-green-50">
                <CardContent className="flex items-center gap-3 p-4">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <p className="text-green-700">{claimSuccess}</p>
                </CardContent>
              </Card>
            )}

            {/* Question Card - Requires Location */}
            {scanResult.question &&
              scanResult.question.type !== 'no_question' &&
              !claimSuccess && (
                <Card className="mb-4 border-blue-200 bg-blue-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-blue-800">
                      Pertanyaan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Location required warning */}
                    {!location && (
                      <div className="mb-4 rounded-lg bg-yellow-100 border border-yellow-300 p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">
                              Lokasi Diperlukan
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                              Untuk menjawab pertanyaan kepemilikan, Anda harus
                              mengizinkan akses lokasi. Data lokasi diperlukan
                              untuk memastikan data yang bersih dan mencegah
                              penyalahgunaan.
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2 border-yellow-400 text-yellow-800 hover:bg-yellow-200"
                              onClick={() => setShowLocationDialog(true)}
                            >
                              <MapPin className="mr-2 h-4 w-4" />
                              Izinkan Lokasi
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="mb-4 text-blue-700">
                      {scanResult.question.message}
                    </p>
                    <div className="space-y-2">
                      {scanResult.question.options?.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-start text-left"
                          disabled={claimLoading || !location}
                          onClick={() => {
                            const isFirstHand =
                              option.toLowerCase().includes('pertama') ||
                              option.toLowerCase().includes('pemilik pertama');
                            handleClaim(isFirstHand, option);
                          }}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>

                    {/* Show message when buttons are disabled */}
                    {!location && (
                      <p className="mt-3 text-xs text-gray-500 text-center">
                        Tombol di atas akan aktif setelah Anda mengizinkan akses
                        lokasi
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

            {/* History Timeline */}
            {scanResult.history && scanResult.history.length > 0 && (
              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" />
                    Riwayat Scan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scanResult.history.map((scan, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 border-l-2 border-gray-200 pl-4"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            Scan #{scan.scanNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(scan.createdAt).toLocaleString('id-ID')}
                          </p>
                          {scan.isFirstHand !== null && (
                            <Badge
                              variant={
                                scan.isFirstHand ? 'default' : 'secondary'
                              }
                              className="mt-1"
                            >
                              {scan.isFirstHand
                                ? 'Tangan Pertama'
                                : 'Second Hand'}
                            </Badge>
                          )}
                          {scan.sourceInfo && (
                            <p className="mt-1 text-xs text-gray-600">
                              {scan.sourceInfo}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Scan Again Button */}
            <Button
              onClick={resetScan}
              variant="outline"
              className="w-full gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Scan Tag Lain
            </Button>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Powered by Etags Blockchain Verification</p>
        </div>
      </div>

      {/* Location Permission Dialog */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Izin Lokasi
            </DialogTitle>
            <DialogDescription>
              Kami membutuhkan akses lokasi Anda
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="mb-2 font-medium text-blue-800 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Mengapa kami membutuhkan lokasi?
              </h4>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Deteksi Pemalsuan:</strong> Membantu
                    mengidentifikasi pola distribusi produk palsu berdasarkan
                    lokasi
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Verifikasi Keaslian:</strong> Memastikan produk
                    didistribusikan melalui jalur resmi
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Perlindungan Konsumen:</strong> Membantu brand
                    melacak dan menindak penjual produk palsu
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-gray-200 p-3 text-xs text-gray-600">
              <p>
                <strong>Privasi Anda terjaga:</strong> Data lokasi hanya
                digunakan untuk verifikasi produk dan tidak akan dibagikan ke
                pihak ketiga.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button onClick={confirmLocationAccess} className="w-full gap-2">
              <MapPin className="h-4 w-4" />
              Izinkan Akses Lokasi
            </Button>
            <Button
              onClick={skipLocationAccess}
              variant="ghost"
              className="w-full text-gray-500"
            >
              Lewati
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
