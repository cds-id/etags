'use client';

import { useEffect, useState, useActionState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Shield,
  Building2,
  Package,
  Tag,
  CheckCircle2,
  ArrowRight,
  Upload,
  Loader2,
  PartyPopper,
} from 'lucide-react';
import {
  getOnboardingStatus,
  createOnboardingBrand,
  createOnboardingProduct,
  createOnboardingTag,
  completeOnboarding,
  getOnboardingProducts,
  type OnboardingState,
} from '@/lib/actions/onboarding';

type OnboardingStatusType = {
  step: number;
  complete: boolean;
  hasBrand?: boolean;
  hasProduct?: boolean;
  hasTag?: boolean;
  brandId?: number;
  brandName?: string;
  productId?: number;
};

type ProductOption = {
  id: number;
  code: string;
  name: string;
};

const steps = [
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

        // If complete, redirect to dashboard
        if (result.complete && result.step === 4) {
          // Don't redirect, show completion screen
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = status?.step === step.id;
              const isComplete =
                status?.step && status.step > step.id ? true : false;

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

// Step 1: Brand Setup
function BrandStep({ onSuccess }: { onSuccess: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState<
    OnboardingState,
    FormData
  >(createOnboardingBrand, {});

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          Setup Brand Anda
        </CardTitle>
        <CardDescription>
          Buat profil brand untuk memulai melindungi produk Anda. Informasi ini
          akan ditampilkan saat pelanggan memverifikasi produk.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nama Brand *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Contoh: Batik Nusantara"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptions">Deskripsi Brand *</Label>
            <Textarea
              id="descriptions"
              name="descriptions"
              placeholder="Ceritakan tentang brand Anda, nilai-nilai, dan keunggulan produk..."
              rows={4}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo Brand (Opsional)</Label>
            <div className="flex items-start gap-4">
              {logoPreview && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-20 w-20 rounded-md border object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Input
                    id="logo"
                    name="logo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={handleFileChange}
                    disabled={isPending}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo')?.click()}
                    disabled={isPending}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {logoPreview ? 'Ganti Logo' : 'Upload Logo'}
                  </Button>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Format: JPEG, PNG, WebP, SVG (maks. 5MB)
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  Lanjut ke Produk
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Step 2: Product Setup
function ProductStep({
  brandName,
  onSuccess,
}: {
  brandName?: string;
  onSuccess: () => void;
}) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState<
    OnboardingState,
    FormData
  >(createOnboardingProduct, {});

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          Tambah Produk Pertama
        </CardTitle>
        <CardDescription>
          {brandName && (
            <span className="text-blue-600 font-medium">{brandName}</span>
          )}{' '}
          - Daftarkan produk pertama yang ingin Anda lindungi dari pemalsuan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Produk *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Contoh: Kemeja Batik Premium"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select name="category" defaultValue="Umum" disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Umum">Umum</SelectItem>
                  <SelectItem value="Fashion">Fashion</SelectItem>
                  <SelectItem value="Elektronik">Elektronik</SelectItem>
                  <SelectItem value="Makanan">Makanan & Minuman</SelectItem>
                  <SelectItem value="Kosmetik">Kosmetik</SelectItem>
                  <SelectItem value="Obat">Obat & Suplemen</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi Produk *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Jelaskan detail produk, bahan, ukuran, warna, dll..."
              rows={3}
              required
              disabled={isPending}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="0"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU / Kode Produk</Label>
              <Input
                id="sku"
                name="sku"
                placeholder="Contoh: BTK-001"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Foto Produk (Opsional)</Label>
            <div className="flex items-start gap-4">
              {imagePreview && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="h-24 w-24 rounded-md border object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    disabled={isPending}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image')?.click()}
                    disabled={isPending}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {imagePreview ? 'Ganti Foto' : 'Upload Foto'}
                  </Button>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Format: JPEG, PNG, WebP (maks. 5MB)
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  Lanjut ke Tag
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Step 3: Tag Setup
function TagStep({
  products,
  onSuccess,
}: {
  products: ProductOption[];
  onSuccess: () => void;
}) {
  // Initialize with first product if available
  const [selectedProduct, setSelectedProduct] = useState<string>(() =>
    products.length > 0 ? String(products[0].id) : ''
  );
  const [state, formAction, isPending] = useActionState<
    OnboardingState,
    FormData
  >(createOnboardingTag, {});

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-blue-600" />
          Buat Tag Pertama
        </CardTitle>
        <CardDescription>
          Tag adalah kode unik yang akan ditempelkan pada produk Anda. Tag ini
          terhubung ke blockchain untuk mencegah pemalsuan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="productId">Pilih Produk *</Label>
            <input type="hidden" name="productId" value={selectedProduct} />
            <Select
              value={selectedProduct}
              onValueChange={setSelectedProduct}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih produk" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={String(product.id)}>
                    {product.name} ({product.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="distributorName">Nama Distributor</Label>
              <Input
                id="distributorName"
                name="distributorName"
                placeholder="Contoh: Toko Batik Jaya"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distributorLocation">Lokasi Distributor</Label>
              <Input
                id="distributorLocation"
                name="distributorLocation"
                placeholder="Contoh: Jakarta, Indonesia"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchNumber">Nomor Batch</Label>
            <Input
              id="batchNumber"
              name="batchNumber"
              placeholder="Contoh: BATCH-2024-001"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Informasi tambahan tentang tag ini..."
              rows={2}
              disabled={isPending}
            />
          </div>

          <div className="rounded-lg border bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-blue-900">
              Apa yang terjadi selanjutnya?
            </h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>1. Tag akan dibuat dengan kode QR unik</li>
              <li>2. Anda bisa mencetak dan menempelkan QR ke produk</li>
              <li>3. Stamp tag ke blockchain untuk verifikasi permanen</li>
              <li>4. Pelanggan dapat scan QR untuk verifikasi keaslian</li>
            </ul>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat Tag...
                </>
              ) : (
                <>
                  Buat Tag & Selesai
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Step 4: Complete
function CompleteStep() {
  const [isCompleting, setIsCompleting] = useState(false);
  const { update } = useSession();
  const router = useRouter();

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await completeOnboarding();
      // Force session update to reflect new onboarding status
      await update();
      // Redirect to dashboard
      router.push('/manage');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsCompleting(false);
    }
  };

  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <PartyPopper className="h-10 w-10 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Selamat! Setup Selesai</CardTitle>
        <CardDescription className="text-base">
          Anda telah berhasil mengatur brand, produk, dan tag pertama Anda.
          Sekarang Anda siap untuk melindungi produk dari pemalsuan!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border bg-gray-50 p-4">
          <h4 className="mb-3 font-medium">Langkah Selanjutnya:</h4>
          <div className="grid gap-3 text-left text-sm sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
              <span>Stamp tag ke blockchain</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
              <span>Cetak QR code tag</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
              <span>Tambah lebih banyak produk</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
              <span>Pantau scan & verifikasi</span>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          onClick={handleComplete}
          disabled={isCompleting}
          className="w-full sm:w-auto"
        >
          {isCompleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mengalihkan...
            </>
          ) : (
            <>
              Masuk ke Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
