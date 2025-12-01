'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
import { Separator } from '@/components/ui/separator';
import {
  createProduct,
  updateProduct,
  type ProductFormState,
} from '@/lib/actions/products';
import {
  productTemplates,
  getTemplateById,
  getTemplateDefaults,
  type ProductTemplate,
  type ProductMetadata,
} from '@/lib/product-templates';
import { ArrowLeft, ImagePlus, X } from 'lucide-react';

type Brand = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  code: string;
  metadata: unknown;
  status: number;
  brand_id: number;
  brand: Brand;
};

type ProductFormPageProps = {
  product?: Product | null;
  brands: Brand[];
  isAdmin?: boolean;
};

export function ProductFormPage({
  product,
  brands,
  isAdmin = true,
}: ProductFormPageProps) {
  const router = useRouter();
  const isEdit = !!product;

  const existingMetadata = product?.metadata as ProductMetadata | undefined;
  const existingTemplateId = existingMetadata?._template || 'retail_clothes';

  const [selectedTemplateId, setSelectedTemplateId] =
    useState<string>(existingTemplateId);
  const [metadata, setMetadata] = useState<Record<string, unknown>>(
    existingMetadata ||
      getTemplateDefaults(getTemplateById(existingTemplateId)!)
  );
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    (existingMetadata?.images as string[]) || []
  );
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  const selectedTemplate = getTemplateById(selectedTemplateId);

  const boundAction = product
    ? updateProduct.bind(null, product.id)
    : createProduct;

  const [state, formAction, isPending] = useActionState<
    ProductFormState,
    FormData
  >(boundAction, {});

  if (state.success) {
    router.push('/manage/products');
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = getTemplateById(templateId);
    if (template) {
      setMetadata(getTemplateDefaults(template));
      setImagePreviews([]);
      setNewImageFiles([]);
    }
  };

  const handleFieldChange = (name: string, value: unknown) => {
    setMetadata((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = imagePreviews.length + files.length;

    if (totalImages > 5) {
      alert('Maksimal 5 gambar diperbolehkan');
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setNewImageFiles((prev) => [...prev, ...files]);
  };

  const handleImageRemove = (index: number) => {
    const imageUrl = imagePreviews[index];

    if (
      imageUrl.startsWith('http') &&
      existingMetadata?.images?.includes(imageUrl)
    ) {
      setRemovedImages((prev) => [...prev, imageUrl]);
    } else {
      const newFileIndex =
        index - (existingMetadata?.images?.length || 0) + removedImages.length;
      setNewImageFiles((prev) => prev.filter((_, i) => i !== newFileIndex));
    }

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (formData: FormData) => {
    const metadataToSubmit = { ...metadata, images: [] };
    formData.set('metadata', JSON.stringify(metadataToSubmit));
    formData.set('template_id', selectedTemplateId);
    formData.set('removed_images', JSON.stringify(removedImages));

    newImageFiles.forEach((file) => {
      formData.append('images', file);
    });

    formAction(formData);
  };

  const renderField = (field: ProductTemplate['fields'][0]) => {
    const value = metadata[field.name];

    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.name}
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.name}
            value={(value as string) || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
          />
        );

      case 'number':
        return (
          <Input
            id={field.name}
            type="number"
            value={(value as number) || ''}
            onChange={(e) =>
              handleFieldChange(field.name, parseFloat(e.target.value) || 0)
            }
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'select':
        return (
          <Select
            value={(value as string) || ''}
            onValueChange={(v) => handleFieldChange(field.name, v)}
            required={field.required}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Pilih ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'color':
        return (
          <div className="flex gap-2">
            <Input
              id={field.name}
              type="color"
              value={(value as string) || '#000000'}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className="h-10 w-16 cursor-pointer p-1"
              required={field.required}
            />
            <Input
              value={(value as string) || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        );

      case 'images':
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="group relative">
                  {preview.startsWith('data:') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt={`Pratinjau ${index + 1}`}
                      className="h-24 w-24 rounded-lg border object-cover"
                    />
                  ) : (
                    <Image
                      src={preview}
                      alt={`Pratinjau ${index + 1}`}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-lg border object-cover"
                    />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => handleImageRemove(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {imagePreviews.length < 5 && (
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:border-primary hover:bg-muted/50">
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  <span className="mt-1 text-xs text-muted-foreground">
                    Tambah
                  </span>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageAdd}
                    multiple
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {field.description} ({imagePreviews.length}/5)
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const basicFields =
    selectedTemplate?.fields.filter(
      (f) =>
        ['name', 'description', 'category', 'price'].includes(f.name) &&
        f.type !== 'images'
    ) || [];
  const detailFields =
    selectedTemplate?.fields.filter(
      (f) =>
        !['name', 'description', 'category', 'price', 'images'].includes(f.name)
    ) || [];
  const imageField = selectedTemplate?.fields.find((f) => f.type === 'images');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/manage/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isEdit ? 'Edit Produk' : 'Buat Produk'}
          </h2>
          <p className="text-muted-foreground">
            {isEdit
              ? `Mengedit ${(product?.metadata as ProductMetadata)?.name || product?.code}`
              : 'Tambahkan produk baru ke katalog Anda'}
          </p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Dasar</CardTitle>
                <CardDescription>Masukkan detail inti produk</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isEdit && (
                  <div className="space-y-2">
                    <Label htmlFor="template">Template Produk</Label>
                    <Select
                      value={selectedTemplateId}
                      onValueChange={handleTemplateChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih template" />
                      </SelectTrigger>
                      <SelectContent>
                        {productTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTemplate && (
                      <p className="text-sm text-muted-foreground">
                        {selectedTemplate.description}
                      </p>
                    )}
                  </div>
                )}

                {isEdit && (
                  <div className="space-y-2">
                    <Label>Kode Produk</Label>
                    <Input
                      value={product?.code}
                      disabled
                      className="font-mono"
                    />
                  </div>
                )}

                <Separator />

                {basicFields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                      {field.label}
                      {field.required && (
                        <span className="text-destructive"> *</span>
                      )}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Product Details */}
            {detailFields.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Detail Produk</CardTitle>
                  <CardDescription>
                    Spesifikasi dan atribut tambahan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {detailFields.map((field) => (
                      <div
                        key={field.name}
                        className={`space-y-2 ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}
                      >
                        <Label htmlFor={field.name}>
                          {field.label}
                          {field.required && (
                            <span className="text-destructive"> *</span>
                          )}
                        </Label>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Images */}
            {imageField && (
              <Card>
                <CardHeader>
                  <CardTitle>Gambar Produk</CardTitle>
                  <CardDescription>
                    Unggah hingga 5 gambar produk. Gambar pertama akan menjadi
                    gambar utama.
                  </CardDescription>
                </CardHeader>
                <CardContent>{renderField(imageField)}</CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Brand & Status */}
            <Card>
              <CardHeader>
                <CardTitle>Organisasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAdmin ? (
                  <div className="space-y-2">
                    <Label htmlFor="brand_id">
                      Brand <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      name="brand_id"
                      defaultValue={product?.brand_id?.toString()}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem
                            key={brand.id}
                            value={brand.id.toString()}
                          >
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <input
                    type="hidden"
                    name="brand_id"
                    value={brands[0]?.id?.toString() || ''}
                  />
                )}

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    name="status"
                    defaultValue={String(product?.status ?? 1)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Aktif</SelectItem>
                      <SelectItem value="0">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Produk nonaktif tidak akan muncul dalam pilihan tag
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                {state.error && (
                  <p className="mb-4 text-sm text-destructive">{state.error}</p>
                )}
                <div className="flex flex-col gap-2">
                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending
                      ? 'Menyimpan...'
                      : isEdit
                        ? 'Perbarui Produk'
                        : 'Buat Produk'}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/manage/products">Batal</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
