'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Building2,
  Package,
  Tag,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  getOnboardingStatus,
  getOnboardingProducts,
} from '@/lib/actions/onboarding';
import {
  BrandStep,
  ProductStep,
  TagStep,
  CompleteStep,
  type OnboardingStatusType,
  type ProductOption,
  type StepConfig,
} from './components';

const steps: StepConfig[] = [
  {
    id: 1,
    title: 'Setup Brand',
    description: 'Buat profil brand Anda',
    icon: Building2,
  },
  {
    id: 2,
    title: 'Tambah Produk',
    description: 'Daftarkan produk pertama',
    icon: Package,
  },
  {
    id: 3,
    title: 'Buat Tag',
    description: 'Buat tag anti-pemalsuan',
    icon: Tag,
  },
  {
    id: 4,
    title: 'Selesai',
    description: 'Mulai lindungi produk',
    icon: CheckCircle2,
  },
];

export default function OnboardingPage() {
  const [status, setStatus] = useState<OnboardingStatusType | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductOption[]>([]);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const result = await getOnboardingStatus();
        setStatus(result);

        // If on step 3, fetch products
        if (result.step === 3) {
          const prods = await getOnboardingProducts();
          setProducts(prods);
        }
      } catch (error) {
        console.error('Failed to fetch onboarding status:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  const refreshStatus = async () => {
    const result = await getOnboardingStatus();
    setStatus(result);

    if (result.step === 3) {
      const prods = await getOnboardingProducts();
      setProducts(prods);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">Etags</span>
          </Link>
          <span className="text-muted-foreground text-sm">Setup Wizard</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Progress Steps */}
        <ProgressSteps currentStep={status?.step ?? 1} />

        {/* Step Content */}
        <div className="mx-auto max-w-2xl">
          {status?.step === 1 && <BrandStep onSuccess={refreshStatus} />}
          {status?.step === 2 && (
            <ProductStep
              brandName={status.brandName}
              onSuccess={refreshStatus}
            />
          )}
          {status?.step === 3 && (
            <TagStep products={products} onSuccess={refreshStatus} />
          )}
          {status?.step === 4 && <CompleteStep />}
        </div>
      </main>
    </div>
  );
}

function ProgressSteps({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isComplete = currentStep > step.id;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${
                    isComplete
                      ? 'border-green-500 bg-green-500 text-white'
                      : isActive
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${isActive ? 'text-blue-600' : isComplete ? 'text-green-600' : 'text-gray-500'}`}
                  >
                    {step.title}
                  </p>
                  <p className="text-muted-foreground hidden text-xs sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 ${isComplete ? 'bg-green-500' : 'bg-gray-300'}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
