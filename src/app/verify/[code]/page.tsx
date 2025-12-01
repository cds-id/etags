'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  Clock,
  MapPin,
  Package,
  Hash,
  ExternalLink,
  RefreshCw,
  Users,
  Scan,
  Calendar,
  Globe,
  FileJson,
  Link as LinkIcon,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { VerifyResponse } from '@/app/api/verify/route';

const BASESCAN_URL = 'https://sepolia.basescan.org';

export default function VerifyPage() {
  const params = useParams();
  const code = params.code as string;

  const [data, setData] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const fetchVerification = useCallback(async () => {
    if (!code) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/verify?code=${encodeURIComponent(code)}`
      );
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
  }, [code]);

  useEffect(() => {
    fetchVerification();
  }, [fetchVerification]);

  // Format timestamp
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

  // Get risk color
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  // Get risk badge
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'critical':
        return (
          <Badge className="bg-red-100 text-red-800">
            <ShieldX className="mr-1 h-3 w-3" />
            Risiko Kritis
          </Badge>
        );
      case 'high':
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <ShieldAlert className="mr-1 h-3 w-3" />
            Risiko Tinggi
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Risiko Sedang
          </Badge>
        );
      default:
        return (
          <Badge className="bg-green-100 text-green-800">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Risiko Rendah
          </Badge>
        );
    }
  };

  // Get flag icon
  const getFlagIcon = (severity: string) => {
    switch (severity) {
      case 'danger':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Memverifikasi tag...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-7 w-7 text-blue-600" />
                Verifikasi Tag
              </h1>
              <p className="text-sm text-gray-600 font-mono">{code}</p>
            </div>
            <Button
              variant="outline"
              onClick={fetchVerification}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Error State */}
        {error && !data?.tag && (
          <Card className="mb-6 border-red-300 bg-red-50">
            <CardContent className="p-6 text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Tag Tidak Ditemukan
              </h2>
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-sm text-red-500">
                Pastikan kode tag yang Anda masukkan benar atau hubungi penjual
                untuk konfirmasi.
              </p>
            </CardContent>
          </Card>
        )}

        {data?.tag && (
          <>
            {/* Main Status Card */}
            <Card
              className={`mb-6 ${
                data.tag.isRevoked
                  ? 'border-red-500 bg-red-50'
                  : data.tag.isStamped
                    ? 'border-green-300 bg-green-50'
                    : 'border-yellow-300 bg-yellow-50'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {data.tag.isRevoked ? (
                      <ShieldX className="h-16 w-16 text-red-500" />
                    ) : data.tag.isStamped ? (
                      <ShieldCheck className="h-16 w-16 text-green-500" />
                    ) : (
                      <ShieldAlert className="h-16 w-16 text-yellow-500" />
                    )}
                    <div>
                      <h2
                        className={`text-2xl font-bold ${
                          data.tag.isRevoked
                            ? 'text-red-800'
                            : data.tag.isStamped
                              ? 'text-green-800'
                              : 'text-yellow-800'
                        }`}
                      >
                        {data.tag.isRevoked
                          ? 'TAG DICABUT'
                          : data.tag.isStamped
                            ? 'Tag Terverifikasi'
                            : 'Tag Tidak Terverifikasi'}
                      </h2>
                      <p
                        className={`text-sm ${
                          data.tag.isRevoked
                            ? 'text-red-600'
                            : data.tag.isStamped
                              ? 'text-green-600'
                              : 'text-yellow-600'
                        }`}
                      >
                        {data.tag.isRevoked
                          ? 'Tag ini telah dicabut dari blockchain. Produk mungkin palsu.'
                          : data.tag.isStamped
                            ? 'Tag ini terdaftar dan terverifikasi di blockchain.'
                            : 'Tag ini belum terverifikasi di blockchain.'}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={data.tag.isRevoked ? 'destructive' : 'secondary'}
                    className="text-sm px-3 py-1"
                  >
                    {data.tag.chainStatusLabel}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Fraud Analysis Card */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Analisis Keamanan
                  </CardTitle>
                  {getRiskBadge(data.fraudAnalysis.overallRisk)}
                </div>
              </CardHeader>
              <CardContent>
                {/* Risk Score Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Skor Risiko</span>
                    <span className="text-sm font-semibold">
                      {data.fraudAnalysis.riskScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getRiskColor(data.fraudAnalysis.overallRisk)}`}
                      style={{ width: `${data.fraudAnalysis.riskScore}%` }}
                    />
                  </div>
                </div>

                {/* Flags */}
                <div className="space-y-2">
                  {data.fraudAnalysis.flags.map((flag, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        flag.severity === 'danger'
                          ? 'bg-red-50'
                          : flag.severity === 'warning'
                            ? 'bg-yellow-50'
                            : 'bg-green-50'
                      }`}
                    >
                      {getFlagIcon(flag.severity)}
                      <span
                        className={`text-sm ${
                          flag.severity === 'danger'
                            ? 'text-red-700'
                            : flag.severity === 'warning'
                              ? 'text-yellow-700'
                              : 'text-green-700'
                        }`}
                      >
                        {flag.message}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Product Info */}
            {data.tag.products.length > 0 && (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    Informasi Produk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.tag.products.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      {product.brandLogo && (
                        <Image
                          src={product.brandLogo}
                          alt={product.brand}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-lg object-contain bg-white p-2"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600">{product.brand}</p>
                        {product.description && (
                          <p className="text-sm text-gray-500 mt-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Distribution Info */}
            {data.tag.distribution &&
              (data.tag.distribution.country ||
                data.tag.distribution.region ||
                data.tag.distribution.channel) && (
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      Informasi Distribusi
                    </CardTitle>
                    <CardDescription>
                      Wilayah distribusi resmi produk ini
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {data.tag.distribution.country && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Negara</p>
                          <p className="font-medium">
                            {data.tag.distribution.country}
                          </p>
                        </div>
                      )}
                      {data.tag.distribution.region && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Wilayah</p>
                          <p className="font-medium">
                            {data.tag.distribution.region}
                          </p>
                        </div>
                      )}
                      {data.tag.distribution.channel && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Channel</p>
                          <p className="font-medium">
                            {data.tag.distribution.channel}
                          </p>
                        </div>
                      )}
                      {data.tag.distribution.intendedMarket && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Pasar</p>
                          <p className="font-medium">
                            {data.tag.distribution.intendedMarket}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Scan Statistics */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scan className="h-5 w-5 text-green-600" />
                  Statistik Pemindaian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Scan className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {data.scanStats.totalScans}
                    </p>
                    <p className="text-xs text-gray-500">Total Scan</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Users className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {data.scanStats.uniqueScanners}
                    </p>
                    <p className="text-xs text-gray-500">Pemindai Unik</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <MapPin className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {data.scanStats.scanLocations.length}
                    </p>
                    <p className="text-xs text-gray-500">Lokasi Berbeda</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Calendar className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">
                      {data.scanStats.lastScanAt
                        ? formatTime(data.scanStats.lastScanAt)
                        : '-'}
                    </p>
                    <p className="text-xs text-gray-500">Scan Terakhir</p>
                  </div>
                </div>

                {/* Scan Locations */}
                {data.scanStats.scanLocations.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Lokasi Pemindaian:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {data.scanStats.scanLocations
                        .slice(0, 5)
                        .map((location, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            {location.length > 50
                              ? location.substring(0, 50) + '...'
                              : location}
                          </Badge>
                        ))}
                      {data.scanStats.scanLocations.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{data.scanStats.scanLocations.length - 5} lainnya
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scan History */}
            {data.scanHistory.length > 0 && (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Riwayat Pemindaian
                  </CardTitle>
                  <CardDescription>
                    {data.scanHistory.length} pemindaian tercatat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(showAllHistory
                      ? data.scanHistory
                      : data.scanHistory.slice(0, 5)
                    ).map((scan, index) => (
                      <div
                        key={index}
                        className="relative border-l-2 border-gray-200 pl-4 pb-4 last:pb-0"
                      >
                        {/* Timeline dot */}
                        <div
                          className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white ${
                            scan.isFirstHand === true
                              ? 'bg-green-500'
                              : scan.isFirstHand === false
                                ? 'bg-orange-500'
                                : 'bg-gray-400'
                          }`}
                        />

                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              Scan #{scan.scanNumber}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(scan.createdAt)}
                            </span>
                          </div>

                          {scan.locationName && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">
                                {scan.locationName}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            {scan.isFirstHand !== null && (
                              <Badge
                                variant={
                                  scan.isFirstHand ? 'default' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {scan.isFirstHand
                                  ? 'Tangan Pertama'
                                  : 'Second Hand'}
                              </Badge>
                            )}
                            {scan.sourceInfo && (
                              <span className="text-xs text-gray-500">
                                {scan.sourceInfo}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {data.scanHistory.length > 5 && (
                    <Button
                      variant="ghost"
                      className="w-full mt-4"
                      onClick={() => setShowAllHistory(!showAllHistory)}
                    >
                      {showAllHistory ? (
                        <>
                          <ChevronUp className="mr-2 h-4 w-4" />
                          Tampilkan Lebih Sedikit
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-2 h-4 w-4" />
                          Tampilkan Semua ({data.scanHistory.length})
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Blockchain Info */}
            {data.blockchainMetadata && (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Hash className="h-5 w-5 text-blue-600" />
                    Data Blockchain
                  </CardTitle>
                  <CardDescription>
                    Informasi yang tercatat di blockchain
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Network</p>
                      <p className="font-medium">
                        {data.blockchainMetadata.network}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Waktu Stamp</p>
                      <p className="font-medium text-sm">
                        {formatTime(data.blockchainMetadata.stampedAt)}
                      </p>
                    </div>
                  </div>

                  {data.blockchainMetadata.transactionHash && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">
                        Transaction Hash
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-gray-700 truncate flex-1">
                          {data.blockchainMetadata.transactionHash}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          asChild
                        >
                          <a
                            href={`${BASESCAN_URL}/tx/${data.blockchainMetadata.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">
                      Contract Address
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-gray-700 truncate flex-1">
                        {data.blockchainMetadata.contractAddress}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        asChild
                      >
                        <a
                          href={`${BASESCAN_URL}/address/${data.blockchainMetadata.contractAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <a
                        href={data.blockchainMetadata.metadataUrl}
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
                      className="flex-1"
                      asChild
                    >
                      <a
                        href={data.blockchainMetadata.qrCodeUrl}
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
            )}

            {/* Info Card */}
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Tentang Verifikasi Tag</p>
                    <p className="text-blue-700">
                      Halaman ini menampilkan status verifikasi tag produk. Tag
                      yang terverifikasi menunjukkan bahwa produk tersebut
                      terdaftar di blockchain dan dapat dilacak keasliannya.
                      Jika Anda menemukan tag yang dicurigai palsu, segera
                      laporkan ke pihak berwenang.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
