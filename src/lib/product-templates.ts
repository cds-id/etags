// Product template types and definitions

export type ProductTemplateField = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'images' | 'color';
  required: boolean;
  options?: string[]; // For select type
  placeholder?: string;
  description?: string;
};

export type ProductTemplate = {
  id: string;
  name: string;
  description: string;
  fields: ProductTemplateField[];
};

// Retail Clothes Template
export const retailClothesTemplate: ProductTemplate = {
  id: 'retail_clothes',
  name: 'Retail - Clothes',
  description: 'Template for clothing products (shirts, pants, jackets, etc.)',
  fields: [
    {
      name: 'name',
      label: 'Product Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Classic Cotton T-Shirt',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
      placeholder: 'Product description...',
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        'T-Shirt',
        'Shirt',
        'Pants',
        'Jeans',
        'Jacket',
        'Hoodie',
        'Sweater',
        'Dress',
        'Skirt',
        'Shorts',
        'Underwear',
        'Socks',
        'Other',
      ],
    },
    {
      name: 'size',
      label: 'Size',
      type: 'select',
      required: true,
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'],
    },
    {
      name: 'color',
      label: 'Color',
      type: 'color',
      required: true,
      placeholder: 'Select color',
    },
    {
      name: 'color_name',
      label: 'Color Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Navy Blue',
    },
    {
      name: 'material',
      label: 'Material',
      type: 'text',
      required: true,
      placeholder: 'e.g., 100% Cotton',
    },
    {
      name: 'price',
      label: 'Price (IDR)',
      type: 'number',
      required: true,
      placeholder: '0',
    },
    {
      name: 'sku',
      label: 'SKU',
      type: 'text',
      required: false,
      placeholder: 'Internal SKU code',
    },
    {
      name: 'weight',
      label: 'Weight (grams)',
      type: 'number',
      required: false,
      placeholder: '0',
    },
    {
      name: 'care_instructions',
      label: 'Care Instructions',
      type: 'textarea',
      required: false,
      placeholder: 'Washing and care instructions...',
    },
    {
      name: 'images',
      label: 'Product Images',
      type: 'images',
      required: true,
      description: 'Upload product images (max 5 images)',
    },
  ],
};

// Generic Product Template
export const genericTemplate: ProductTemplate = {
  id: 'generic',
  name: 'Generic Product',
  description: 'Basic template for any type of product',
  fields: [
    {
      name: 'name',
      label: 'Product Name',
      type: 'text',
      required: true,
      placeholder: 'Product name',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
      placeholder: 'Product description...',
    },
    {
      name: 'price',
      label: 'Price (IDR)',
      type: 'number',
      required: true,
      placeholder: '0',
    },
    {
      name: 'sku',
      label: 'SKU',
      type: 'text',
      required: false,
      placeholder: 'Internal SKU code',
    },
    {
      name: 'images',
      label: 'Product Images',
      type: 'images',
      required: false,
      description: 'Upload product images (max 5 images)',
    },
  ],
};

// All available templates
export const productTemplates: ProductTemplate[] = [
  retailClothesTemplate,
  genericTemplate,
];

// Get template by ID
export function getTemplateById(id: string): ProductTemplate | undefined {
  return productTemplates.find((t) => t.id === id);
}

// Get default values for a template
export function getTemplateDefaults(
  template: ProductTemplate
): Record<string, unknown> {
  const defaults: Record<string, unknown> = {
    _template: template.id,
  };

  for (const field of template.fields) {
    if (field.type === 'images') {
      defaults[field.name] = [];
    } else if (field.type === 'number') {
      defaults[field.name] = 0;
    } else {
      defaults[field.name] = '';
    }
  }

  return defaults;
}

// Product metadata type (stored in JSON)
export type ProductMetadata = {
  _template: string;
  name: string;
  description: string;
  images: string[];
  [key: string]: unknown;
};

// Tag metadata type (stored in JSON)
export type TagMetadata = {
  notes?: string;
  batch_number?: string;
  manufacture_date?: string;
  expiry_date?: string;
  [key: string]: unknown;
};
