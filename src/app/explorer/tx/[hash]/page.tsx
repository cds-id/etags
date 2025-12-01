'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  ArrowLeft,
  ExternalLink,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Hash,
  Blocks,
  FileCode,
  Fuel,
  RefreshCw,
  ArrowDown,
} from 'lucide-react';
import type { ExplorerResponse } from '@/app/api/explorer/route';

type Transaction = NonNullable<ExplorerResponse['transaction']>;

const BASESCAN_URL = 'https://sepolia.basescan.org';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hash = params.hash as string;

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Fetch transaction
  const fetchTransaction = useCallback(async () => {
    if (!hash) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/explorer?action=transaction&txHash=${hash}`
      );
      const data: ExplorerResponse = await response.json();

      if (data.success && data.transaction) {
        setTransaction(data.transaction);
      } else {
        setError(data.error || 'Transaction not found');
      }
    } catch (err) {
      console.error('Failed to fetch transaction:', err);
      setError('Failed to load transaction');
    } finally {
      setLoading(false);
    }
  }, [hash]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Truncate address/hash
  const truncate = (str: string, start: number = 10, end: number = 8) => {
    if (str.length <= start + end) return str;
    return `${str.slice(0, start)}...${str.slice(-end)}`;
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Get method badge color
  const getMethodBadge = (methodName: string) => {
    const colors: Record<string, string> = {
      createTag: 'bg-blue-100 text-blue-800',
      updateStatus: 'bg-yellow-100 text-yellow-800',
      revokeTag: 'bg-red-100 text-red-800',
      grantRole: 'bg-purple-100 text-purple-800',
    };
    return colors[methodName] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-600">Loading transaction...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Transaction Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                {error || 'The transaction could not be found.'}
              </p>
              <Button onClick={() => router.push('/explorer')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Explorer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/explorer')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Hash className="h-6 w-6 text-blue-600" />
                Transaction Details
              </h1>
              <p className="text-sm text-gray-600 font-mono">
                {truncate(transaction.hash, 16, 12)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Status Banner */}
        <Card
          className={`mb-6 ${
            transaction.status === 'success'
              ? 'border-green-300 bg-green-50'
              : transaction.status === 'failed'
                ? 'border-red-300 bg-red-50'
                : 'border-yellow-300 bg-yellow-50'
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {transaction.status === 'success' ? (
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                ) : transaction.status === 'failed' ? (
                  <XCircle className="h-12 w-12 text-red-500" />
                ) : (
                  <Clock className="h-12 w-12 text-yellow-500" />
                )}
                <div>
                  <p className="text-xl font-semibold">
                    {transaction.status === 'success'
                      ? 'Transaction Success'
                      : transaction.status === 'failed'
                        ? 'Transaction Failed'
                        : 'Transaction Pending'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatTime(transaction.timestamp)}
                  </p>
                </div>
              </div>
              <Badge
                className={`${getMethodBadge(transaction.methodName)} text-sm px-4 py-2`}
              >
                {transaction.methodName}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Hash */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Hash className="h-4 w-4 text-blue-600" />
              Transaction Hash
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
              <code className="text-sm font-mono text-gray-800 break-all flex-1">
                {transaction.hash}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(transaction.hash)}
              >
                {copiedText === transaction.hash ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`${BASESCAN_URL}/tx/${transaction.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  BaseScan
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Overview */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Blocks className="h-4 w-4 text-purple-600" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Block Number</p>
                <p className="font-mono font-semibold text-lg">
                  {transaction.blockNumber.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Value</p>
                <p className="font-mono font-semibold text-lg">
                  {transaction.value} ETH
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* From / To */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Addresses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* From */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">From</p>
              <div className="flex items-center gap-3">
                <code className="text-sm font-mono text-gray-800 break-all flex-1">
                  {transaction.from}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => copyToClipboard(transaction.from)}
                >
                  {copiedText === transaction.from ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  asChild
                >
                  <a
                    href={`${BASESCAN_URL}/address/${transaction.from}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="rounded-full bg-gray-200 p-2">
                <ArrowDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>

            {/* To */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-xs text-blue-600 mb-2">To (Contract)</p>
              <div className="flex items-center gap-3">
                <code className="text-sm font-mono text-gray-800 break-all flex-1">
                  {transaction.to}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => copyToClipboard(transaction.to)}
                >
                  {copiedText === transaction.to ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  asChild
                >
                  <a
                    href={`${BASESCAN_URL}/address/${transaction.to}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gas Info */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Fuel className="h-4 w-4 text-orange-500" />
              Gas Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Gas Used</p>
                <p className="font-mono font-semibold">
                  {parseInt(transaction.gasUsed).toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Gas Price</p>
                <p className="font-mono font-semibold">
                  {transaction.gasPrice} Gwei
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Method */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileCode className="h-4 w-4 text-purple-500" />
              Method Called
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
              <Badge
                className={`${getMethodBadge(transaction.methodName)} text-sm px-4 py-2`}
              >
                {transaction.methodName}
              </Badge>
              <code className="text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded font-mono">
                {transaction.method}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Decoded Input */}
        {transaction.decodedInput && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-green-500" />
                  Decoded Input Data
                </CardTitle>
                <Badge variant="outline">{transaction.decodedInput.name}</Badge>
              </div>
              <CardDescription>
                Function parameters decoded from the transaction input
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(transaction.decodedInput.args).map(
                ([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {key}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7"
                        onClick={() => copyToClipboard(value)}
                      >
                        {copiedText === value ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <code className="text-sm font-mono break-all block bg-white rounded p-3 border text-gray-800">
                      {value}
                    </code>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        )}

        {/* Raw Input */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-500" />
                Raw Input Data
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(transaction.rawInput)}
              >
                {copiedText === transaction.rawInput ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy All
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto max-h-48 font-mono">
              {transaction.rawInput}
            </pre>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push('/explorer')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Explorer
          </Button>
          <Button className="flex-1" asChild>
            <a
              href={`${BASESCAN_URL}/tx/${transaction.hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on BaseScan
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
