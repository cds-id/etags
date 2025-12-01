/**
 * QR Code Template Configuration
 *
 * This file contains the configuration for positioning QR codes on template images.
 * Adjust these values to match your template design.
 *
 * Template: /public/placeholder-qr.jpg (1696x2528 pixels)
 */

export type QRTemplateConfig = {
  // Template information
  template: {
    /** Path to template image relative to /public */
    path: string;
    /** Template width in pixels */
    width: number;
    /** Template height in pixels */
    height: number;
  };

  // QR Code positioning and sizing
  qrCode: {
    /** X position of QR code's top-left corner from template's left edge */
    x: number;
    /** Y position of QR code's top-left corner from template's top edge */
    y: number;
    /** Width of QR code in pixels */
    width: number;
    /** Height of QR code in pixels (same as width for square QR) */
    height: number;
  };

  // Optional text overlays (tag code, product info, etc.)
  textOverlays?: Array<{
    /** Unique identifier for this text field */
    id: string;
    /** What data to display: 'tag_code' | 'product_name' | 'brand_name' | 'custom' */
    content: 'tag_code' | 'product_name' | 'brand_name' | 'custom';
    /** Custom text (only used when content is 'custom') */
    customText?: string;
    /** X position of text */
    x: number;
    /** Y position of text */
    y: number;
    /** Font size in pixels */
    fontSize: number;
    /** Font family */
    fontFamily: string;
    /** Font color (hex) */
    color: string;
    /** Text alignment: 'left' | 'center' | 'right' */
    align: 'left' | 'center' | 'right';
    /** Max width for text (for alignment calculation) */
    maxWidth?: number;
  }>;

  // Output settings
  output: {
    /** Output format: 'png' | 'jpeg' */
    format: 'png' | 'jpeg';
    /** JPEG quality (0-100, only used for jpeg) */
    quality: number;
  };
};

/**
 * Default template configuration
 *
 * ADJUST THESE VALUES to position the QR code correctly on your template.
 *
 * Tips for finding the right position:
 * 1. Open the template in an image editor
 * 2. Find the center point where you want the QR code
 * 3. Subtract half the QR width/height to get the top-left corner position
 *
 * Example: If you want a 400x400 QR centered at (848, 1200):
 *   x = 848 - 200 = 648
 *   y = 1200 - 200 = 1000
 */
export const DEFAULT_TEMPLATE_CONFIG: QRTemplateConfig = {
  template: {
    path: '/placeholder-qr.jpg',
    width: 1696,
    height: 2528,
  },

  qrCode: {
    // Position: centered horizontally, positioned in the middle area
    // Adjust these values based on your template design
    x: 598, // (1696 - 500) / 2 = 598 (centered for 500px QR)
    y: 1000, // Vertical position from top (moved down)
    width: 500, // QR code width (smaller)
    height: 500, // QR code height (keep same as width for square)
  },

  textOverlays: [
    {
      id: 'tag_code',
      content: 'tag_code',
      x: 848, // Center of template
      y: 1550, // Below QR code (adjusted)
      fontSize: 48,
      fontFamily: 'Arial',
      color: '#000000',
      align: 'center',
      maxWidth: 1200,
    },
    {
      id: 'product_name',
      content: 'product_name',
      x: 848,
      y: 1620, // Below tag code (adjusted)
      fontSize: 36,
      fontFamily: 'Arial',
      color: '#333333',
      align: 'center',
      maxWidth: 1200,
    },
  ],

  output: {
    format: 'png',
    quality: 90,
  },
};

/**
 * You can create multiple template configurations for different use cases
 */
export const TEMPLATE_CONFIGS: Record<string, QRTemplateConfig> = {
  default: DEFAULT_TEMPLATE_CONFIG,

  // Example: A compact version with smaller QR
  // compact: {
  //   ...DEFAULT_TEMPLATE_CONFIG,
  //   qrCode: {
  //     x: 648,
  //     y: 900,
  //     width: 400,
  //     height: 400,
  //   },
  // },
};

/**
 * Get template configuration by name
 */
export function getTemplateConfig(name: string = 'default'): QRTemplateConfig {
  return TEMPLATE_CONFIGS[name] || DEFAULT_TEMPLATE_CONFIG;
}

/**
 * Validate configuration values
 */
export function validateConfig(config: QRTemplateConfig): string[] {
  const errors: string[] = [];

  // Check QR is within template bounds
  if (config.qrCode.x < 0) {
    errors.push('QR x position cannot be negative');
  }
  if (config.qrCode.y < 0) {
    errors.push('QR y position cannot be negative');
  }
  if (config.qrCode.x + config.qrCode.width > config.template.width) {
    errors.push('QR code extends beyond template right edge');
  }
  if (config.qrCode.y + config.qrCode.height > config.template.height) {
    errors.push('QR code extends beyond template bottom edge');
  }

  return errors;
}
