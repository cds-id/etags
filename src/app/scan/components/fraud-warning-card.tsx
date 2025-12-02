'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { getChannelLabel, getCountryLabel, getMarketLabel } from './constants';

type FraudWarningCardProps = {
  fraudAnalysis: {
    isSuspicious: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    reasons: string[];
    recommendation: string;
  };
  distribution?: {
    region?: string;
    country?: string;
    channel?: string;
    intendedMarket?: string;
  };
};

export function FraudWarningCard({
  fraudAnalysis,
  distribution,
}: FraudWarningCardProps) {
  if (!fraudAnalysis.isSuspicious) {
    return (
      <Card className="mb-6 border-0 bg-linear-to-br from-emerald-500/10 via-emerald-500/5 to-transparent shadow-lg shadow-emerald-500/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <CardContent className="flex items-center gap-4 p-4 sm:p-5 relative">
          <div className="h-12 w-12 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-emerald-800 dark:text-emerald-300">
              Lokasi Sesuai
            </p>
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Lokasi scan sesuai dengan wilayah distribusi resmi produk.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const riskConfig = {
    critical: {
      gradient: 'from-red-500/15 via-red-500/5',
      shadow: 'shadow-red-500/10',
      bg: 'bg-red-500/10',
      iconBg: 'from-red-500 to-rose-600',
      iconShadow: 'shadow-red-500/30',
      text: 'text-red-800 dark:text-red-300',
      subtext: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      Icon: ShieldX,
      title: 'Peringatan Kritis!',
    },
    high: {
      gradient: 'from-orange-500/15 via-orange-500/5',
      shadow: 'shadow-orange-500/10',
      bg: 'bg-orange-500/10',
      iconBg: 'from-orange-500 to-amber-600',
      iconShadow: 'shadow-orange-500/30',
      text: 'text-orange-800 dark:text-orange-300',
      subtext: 'text-orange-700 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
      Icon: ShieldAlert,
      title: 'Risiko Tinggi!',
    },
    medium: {
      gradient: 'from-yellow-500/15 via-yellow-500/5',
      shadow: 'shadow-yellow-500/10',
      bg: 'bg-yellow-500/10',
      iconBg: 'from-yellow-500 to-amber-600',
      iconShadow: 'shadow-yellow-500/30',
      text: 'text-yellow-800 dark:text-yellow-300',
      subtext: 'text-yellow-700 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800',
      Icon: AlertTriangle,
      title: 'Perhatian!',
    },
    low: {
      gradient: 'from-slate-500/15 via-slate-500/5',
      shadow: 'shadow-slate-500/10',
      bg: 'bg-slate-500/10',
      iconBg: 'from-slate-500 to-gray-600',
      iconShadow: 'shadow-slate-500/30',
      text: 'text-slate-800 dark:text-slate-300',
      subtext: 'text-slate-700 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-700',
      Icon: AlertTriangle,
      title: 'Informasi',
    },
  };

  const config = riskConfig[fraudAnalysis.riskLevel];
  const IconComponent = config.Icon;

  return (
    <Card
      className={`mb-6 border-0 bg-linear-to-br ${config.gradient} to-transparent ${config.shadow} shadow-lg overflow-hidden relative`}
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 ${config.bg} rounded-full -translate-y-1/2 translate-x-1/4`}
      />
      <CardHeader className="pb-3 relative">
        <CardTitle className={`flex items-center gap-3 text-lg ${config.text}`}>
          <div
            className={`h-10 w-10 rounded-xl bg-linear-to-br ${config.iconBg} flex items-center justify-center shadow-lg ${config.iconShadow} shrink-0`}
          >
            <IconComponent className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold">{config.title}</span>
            <CardDescription className={config.subtext}>
              Skor Risiko: {fraudAnalysis.riskScore}/100
            </CardDescription>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {/* Risk reasons */}
        {fraudAnalysis.reasons.length > 0 && (
          <div
            className={`mb-4 bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border ${config.border}`}
          >
            <p className={`text-sm font-semibold mb-2 ${config.text}`}>
              Alasan:
            </p>
            <ul className="space-y-1.5">
              {fraudAnalysis.reasons.map((reason, idx) => (
                <li
                  key={idx}
                  className={`text-sm ${config.subtext} flex items-start gap-2`}
                >
                  <span className="text-xs mt-1">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendation */}
        <div
          className={`bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border ${config.border}`}
        >
          <p className={`font-semibold text-sm ${config.text}`}>Rekomendasi:</p>
          <p className={`text-sm mt-1 ${config.subtext}`}>
            {fraudAnalysis.recommendation}
          </p>
        </div>

        {/* Distribution info comparison */}
        {distribution && (
          <div
            className={`mt-4 bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border ${config.border}`}
          >
            <p className={`text-xs font-semibold ${config.text} mb-2`}>
              Informasi Distribusi Resmi:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {distribution.region && (
                <div className={config.subtext}>
                  <span className="opacity-70">Wilayah:</span>{' '}
                  <span className="font-medium">{distribution.region}</span>
                </div>
              )}
              {distribution.country && (
                <div className={config.subtext}>
                  <span className="opacity-70">Negara:</span>{' '}
                  <span className="font-medium">
                    {getCountryLabel(distribution.country)}
                  </span>
                </div>
              )}
              {distribution.channel && (
                <div className={config.subtext}>
                  <span className="opacity-70">Channel:</span>{' '}
                  <span className="font-medium">
                    {getChannelLabel(distribution.channel)}
                  </span>
                </div>
              )}
              {distribution.intendedMarket && (
                <div className={config.subtext}>
                  <span className="opacity-70">Pasar:</span>{' '}
                  <span className="font-medium">
                    {getMarketLabel(distribution.intendedMarket)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
