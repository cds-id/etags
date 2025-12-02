'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import type { ScanResponse } from '@/app/api/scan/route';
import type { ClaimResponse } from '@/app/api/scan/claim/route';

import {
  ScanHeader,
  ScannerCard,
  LoadingCard,
  ErrorCard,
  RevokedWarningCard,
  ValidityCard,
  BlockchainMetadataCard,
  ProductInfoCard,
  ScanInfoCard,
  FraudWarningCard,
  LocationDeniedCard,
  ClaimSuccessCard,
  QuestionCard,
  ScanHistoryCard,
  LocationPermissionDialog,
  type LocationData,
} from './components';

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
  const [showLocationDialog, setShowLocationDialog] = useState(false);
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

  const handleRequestLocation = () => {
    setLocationDenied(false);
    setShowLocationDialog(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-violet-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-violet-900/20 p-4 overflow-x-hidden">
      <div className="mx-auto max-w-md py-4 sm:py-6">
        <ScanHeader />

        {/* Scanner Card */}
        {!scanResult && (
          <ScannerCard
            scanning={scanning}
            fingerprintId={fingerprintId}
            onStartScanner={startScanner}
            onStopScanner={stopScanner}
          />
        )}

        {/* Loading */}
        {loading && <LoadingCard />}

        {/* Error */}
        {error && <ErrorCard error={error} />}

        {/* Scan Result */}
        {scanResult && (
          <>
            {/* Revoked Warning Card */}
            <RevokedWarningCard scanResult={scanResult} />

            {/* Validity Card */}
            <ValidityCard scanResult={scanResult} />

            {/* Blockchain Metadata */}
            {scanResult.blockchainMetadata && (
              <BlockchainMetadataCard
                blockchainMetadata={scanResult.blockchainMetadata}
              />
            )}

            {/* Product Info */}
            {scanResult.tag?.products && scanResult.tag.products.length > 0 && (
              <ProductInfoCard products={scanResult.tag.products} />
            )}

            {/* Scan Info */}
            <ScanInfoCard
              totalScans={scanResult.scanInfo.totalScans}
              scanNumber={scanResult.scanInfo.scanNumber}
              location={location}
            />

            {/* Fraud Detection */}
            {scanResult.fraudAnalysis && (
              <FraudWarningCard
                fraudAnalysis={scanResult.fraudAnalysis}
                distribution={scanResult.tag?.distribution}
              />
            )}

            {/* Warning when location is denied */}
            {locationDenied && !location && (
              <LocationDeniedCard onRequestLocation={handleRequestLocation} />
            )}

            {/* Claim Success */}
            {claimSuccess && <ClaimSuccessCard message={claimSuccess} />}

            {/* Question Card */}
            {scanResult.question &&
              scanResult.question.type !== 'no_question' &&
              !claimSuccess && (
                <QuestionCard
                  question={scanResult.question}
                  location={location}
                  claimLoading={claimLoading}
                  onClaim={handleClaim}
                  onRequestLocation={() => setShowLocationDialog(true)}
                />
              )}

            {/* History Timeline */}
            {scanResult.history && (
              <ScanHistoryCard history={scanResult.history} />
            )}

            {/* Scan Again Button */}
            <Button
              onClick={resetScan}
              variant="outline"
              className="w-full gap-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 shadow-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Scan Tag Lain
            </Button>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Powered by{' '}
            <span className="font-semibold bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Etags Blockchain
            </span>
          </p>
        </div>
      </div>

      {/* Location Permission Dialog */}
      <LocationPermissionDialog
        open={showLocationDialog}
        onOpenChange={setShowLocationDialog}
        onConfirm={confirmLocationAccess}
        onSkip={skipLocationAccess}
      />
    </div>
  );
}
