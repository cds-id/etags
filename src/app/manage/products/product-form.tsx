'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import Image from 'next/image';

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
};

type ProductFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  brands: Brand[];
};

function ProductFormContent({
  product,
  brands,
  onOpenChange,
}: {
  product?: Product | null;
  brands: Brand[];
  onOpenChange: (open: boolean) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
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

  useEffect(() => {
    if (state.success) {
      requestAnimationFrame(() => {
        onOpenChange(false);
      });
    }
  }, [state.success, onOpenChange]);

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
      alert('Maximum 5 images allowed');
      return;
    }

    // Create previews for new files
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

    // If it's an existing image (URL), mark for removal
    if (
      imageUrl.startsWith('http') &&
      existingMetadata?.images?.includes(imageUrl)
    ) {
      setRemovedImages((prev) => [...prev, imageUrl]);
    } else {
      // It's a new file, remove from files array
      const newFileIndex =
        index - (existingMetadata?.images?.length || 0) + removedImages.length;
      setNewImageFiles((prev) => prev.filter((_, i) => i !== newFileIndex));
    }

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (formData: FormData) => {
    // Add metadata as JSON
    const metadataToSubmit = { ...metadata, images: [] }; // images handled separately
    formData.set('metadata', JSON.stringify(metadataToSubmit));
    formData.set('template_id', selectedTemplateId);
    formData.set('removed_images', JSON.stringify(removedImages));

    // Add new image files
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
            rows={3}
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
              <SelectValue
                placeholder={`Select ${field.label.toLowerCase()}`}
              />
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
              className="h-9 w-16 cursor-pointer p-1"
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
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  {preview.startsWith('data:') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="h-20 w-20 rounded-md border object-cover"
                    />
                  ) : (
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-md border object-cover"
                    />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    className="absolute -right-2 -top-2"
                    onClick={() => handleImageRemove(index)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
            {imagePreviews.length < 5 && (
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageAdd}
                multiple
              />
            )}
            <p className="text-xs text-muted-foreground">
              {field.description} ({imagePreviews.length}/5)
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Product' : 'Create Product'}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? 'Update product details.'
            : 'Create a new product using a template.'}
        </DialogDescription>
      </DialogHeader>
      <form
        ref={formRef}
        action={handleSubmit}
        className="max-h-[60vh] space-y-4 overflow-y-auto pr-2"
      >
        <div className="space-y-2">
          <Label htmlFor="brand_id">Brand</Label>
          <Select
            name="brand_id"
            defaultValue={product?.brand_id?.toString()}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id.toString()}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isEdit && (
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Select
              value={selectedTemplateId}
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
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
              <p className="text-xs text-muted-foreground">
                {selectedTemplate.description}
              </p>
            )}
          </div>
        )}

        {selectedTemplate?.fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-destructive"> *</span>}
            </Label>
            {renderField(field)}
          </div>
        ))}

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={String(product?.status ?? 1)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="0">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <DialogFooter className="sticky bottom-0 bg-background pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function ProductForm({
  open,
  onOpenChange,
  product,
  brands,
}: ProductFormProps) {
  const formKey = open ? `product-${product?.id || 'new'}` : 'closed';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {open && (
          <ProductFormContent
            key={formKey}
            product={product}
            brands={brands}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
