'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
} from 'lucide-react';
import type { ScanResponse } from '@/app/api/scan/route';
import type { ClaimResponse } from '@/app/api/scan/claim/route';

type LocationData = {
  latitude: number;
  longitude: number;
  locationName?: string;
};

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [fingerprintId, setFingerprintId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<string | null>(null);

  // Initialize fingerprint
  useEffect(() => {
    const initFingerprint = async () => {
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
    initFingerprint();
  }, []);

  // Request GPS location
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

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
        setLocationDenied(true);
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
          headers: { 'Content-Type': 'application/json' },
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
    [fingerprintId, loading, location, locationRequested, requestLocation]
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
        headers: { 'Content-Type': 'application/json' },
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
            {/* Validity Card */}
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
                </div>
              </CardContent>
            </Card>

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
                        <img
                          src={product.brandLogo}
                          alt={product.brand}
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
                                {scanResult.tag.distribution.country}
                              </span>
                            </div>
                          )}
                          {scanResult.tag.distribution.channel && (
                            <div>
                              <span className="text-gray-500">Channel:</span>{' '}
                              <span className="font-medium">
                                {scanResult.tag.distribution.channel}
                              </span>
                            </div>
                          )}
                          {scanResult.tag.distribution.intendedMarket && (
                            <div>
                              <span className="text-gray-500">Pasar:</span>{' '}
                              <span className="font-medium">
                                {scanResult.tag.distribution.intendedMarket}
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

            {/* Claim Success */}
            {claimSuccess && (
              <Card className="mb-4 border-green-200 bg-green-50">
                <CardContent className="flex items-center gap-3 p-4">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  <p className="text-green-700">{claimSuccess}</p>
                </CardContent>
              </Card>
            )}

            {/* Question Card */}
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
                    <p className="mb-4 text-blue-700">
                      {scanResult.question.message}
                    </p>
                    <div className="space-y-2">
                      {scanResult.question.options?.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-start text-left"
                          disabled={claimLoading}
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
