'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MapPin,
  Globe,
  Package,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type FraudAnalysisCardProps = {
  fraudAnalysis: {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    flags: Array<{
      type: string;
      severity: 'info' | 'warning' | 'danger';
      message: string;
    }>;
  };
  aiAnalysis?: {
    isSuspicious: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    reasons: string[];
    recommendation: string;
    details: {
      locationMatch: boolean;
      channelMatch: boolean;
      marketMatch: boolean;
    };
    fromCache: boolean;
    cacheExpiresAt?: string;
  };
};

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

export function FraudAnalysisCard({
  fraudAnalysis,
  aiAnalysis,
}: FraudAnalysisCardProps) {
  return (
    <Card className="mb-6 border-0 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent shadow-lg shadow-violet-500/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <CardHeader className="pb-3 relative">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent font-semibold">
              Analisis Keamanan AI
            </span>
          </CardTitle>
          {getRiskBadge(fraudAnalysis.overallRisk)}
        </div>
      </CardHeader>
      <CardContent className="relative">
        {/* Risk Score Bar */}
        <div className="mb-5 p-4 rounded-xl bg-white/50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">
              Skor Risiko
            </span>
            <span
              className={`text-lg sm:text-xl font-bold ${
                fraudAnalysis.overallRisk === 'critical'
                  ? 'text-red-600'
                  : fraudAnalysis.overallRisk === 'high'
                    ? 'text-orange-600'
                    : fraudAnalysis.overallRisk === 'medium'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
              }`}
            >
              {fraudAnalysis.riskScore}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getRiskColor(fraudAnalysis.overallRisk)}`}
              style={{
                width: `${Math.max(fraudAnalysis.riskScore, 3)}%`,
              }}
            />
          </div>
        </div>

        {/* Flags */}
        <div className="space-y-2">
          {fraudAnalysis.flags.map((flag, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                flag.severity === 'danger'
                  ? 'bg-red-50/80 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                  : flag.severity === 'warning'
                    ? 'bg-amber-50/80 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                    : 'bg-emerald-50/80 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
              }`}
            >
              <div
                className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                  flag.severity === 'danger'
                    ? 'bg-red-100'
                    : flag.severity === 'warning'
                      ? 'bg-amber-100'
                      : 'bg-emerald-100'
                }`}
              >
                {getFlagIcon(flag.severity)}
              </div>
              <span
                className={`text-xs sm:text-sm font-medium ${
                  flag.severity === 'danger'
                    ? 'text-red-700 dark:text-red-300'
                    : flag.severity === 'warning'
                      ? 'text-amber-700 dark:text-amber-300'
                      : 'text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {flag.message}
              </span>
            </div>
          ))}
        </div>

        {/* AI Analysis Recommendation */}
        {aiAnalysis && (
          <div className="mt-5 pt-5 border-t border-violet-200/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <p className="text-xs sm:text-sm font-semibold text-violet-700 flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-purple-500">
                  <span className="h-2 w-2 bg-white rounded-full animate-pulse" />
                </span>
                Rekomendasi AI
              </p>
              <div className="flex items-center gap-2">
                {aiAnalysis.fromCache && (
                  <Badge
                    variant="outline"
                    className="text-[10px] sm:text-xs bg-violet-50 border-violet-200 text-violet-600"
                  >
                    Cached
                  </Badge>
                )}
                {aiAnalysis.cacheExpiresAt && (
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    Update:{' '}
                    {new Date(aiAnalysis.cacheExpiresAt).toLocaleTimeString(
                      'id-ID',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* AI Recommendation with Markdown */}
            <div
              className={`p-4 rounded-xl overflow-hidden ${
                aiAnalysis.isSuspicious
                  ? 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200'
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
              }`}
            >
              <div
                className={`prose prose-sm max-w-none break-words ${
                  aiAnalysis.isSuspicious
                    ? 'prose-p:text-orange-800 prose-headings:text-orange-900 prose-strong:text-orange-900 prose-li:text-orange-800'
                    : 'prose-p:text-blue-800 prose-headings:text-blue-900 prose-strong:text-blue-900 prose-li:text-blue-800'
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0 text-sm font-medium">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-2 last:mb-0 pl-4 list-disc">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-2 last:mb-0 pl-4 list-decimal">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="mb-1 text-sm">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold">{children}</strong>
                    ),
                    code: ({ children }) => (
                      <code className="bg-black/10 px-1.5 py-0.5 rounded text-xs font-mono break-all">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {aiAnalysis.recommendation}
                </ReactMarkdown>
              </div>
            </div>

            {/* AI Analysis Details */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div
                className={`p-3 rounded-xl text-center border transition-all ${
                  aiAnalysis.details.locationMatch
                    ? 'bg-emerald-50/80 border-emerald-200'
                    : 'bg-red-50/80 border-red-200'
                }`}
              >
                <MapPin
                  className={`h-4 w-4 mx-auto mb-1 ${
                    aiAnalysis.details.locationMatch
                      ? 'text-emerald-500'
                      : 'text-red-500'
                  }`}
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Lokasi
                </p>
                <p
                  className={`text-xs sm:text-sm font-bold ${
                    aiAnalysis.details.locationMatch
                      ? 'text-emerald-700'
                      : 'text-red-700'
                  }`}
                >
                  {aiAnalysis.details.locationMatch ? 'Sesuai' : 'Tidak Sesuai'}
                </p>
              </div>
              <div
                className={`p-3 rounded-xl text-center border transition-all ${
                  aiAnalysis.details.channelMatch
                    ? 'bg-emerald-50/80 border-emerald-200'
                    : 'bg-red-50/80 border-red-200'
                }`}
              >
                <Globe
                  className={`h-4 w-4 mx-auto mb-1 ${
                    aiAnalysis.details.channelMatch
                      ? 'text-emerald-500'
                      : 'text-red-500'
                  }`}
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Channel
                </p>
                <p
                  className={`text-xs sm:text-sm font-bold ${
                    aiAnalysis.details.channelMatch
                      ? 'text-emerald-700'
                      : 'text-red-700'
                  }`}
                >
                  {aiAnalysis.details.channelMatch ? 'Sesuai' : 'Tidak Sesuai'}
                </p>
              </div>
              <div
                className={`p-3 rounded-xl text-center border transition-all ${
                  aiAnalysis.details.marketMatch
                    ? 'bg-emerald-50/80 border-emerald-200'
                    : 'bg-red-50/80 border-red-200'
                }`}
              >
                <Package
                  className={`h-4 w-4 mx-auto mb-1 ${
                    aiAnalysis.details.marketMatch
                      ? 'text-emerald-500'
                      : 'text-red-500'
                  }`}
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Pasar
                </p>
                <p
                  className={`text-xs sm:text-sm font-bold ${
                    aiAnalysis.details.marketMatch
                      ? 'text-emerald-700'
                      : 'text-red-700'
                  }`}
                >
                  {aiAnalysis.details.marketMatch ? 'Sesuai' : 'Tidak Sesuai'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
