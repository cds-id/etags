import QRCode from 'qrcode';

export type QRCodeOptions = {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
};

const DEFAULT_OPTIONS: QRCodeOptions = {
  width: 512,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
};

/**
 * Generate QR code as PNG buffer
 */
export async function generateQRCodeBuffer(
  data: string,
  options?: QRCodeOptions
): Promise<Buffer> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const buffer = await QRCode.toBuffer(data, {
    type: 'png',
    width: mergedOptions.width,
    margin: mergedOptions.margin,
    color: mergedOptions.color,
    errorCorrectionLevel: 'H', // High error correction for better scanning
  });

  return buffer;
}

/**
 * Generate QR code as Data URL (base64)
 */
export async function generateQRCodeDataURL(
  data: string,
  options?: QRCodeOptions
): Promise<string> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const dataUrl = await QRCode.toDataURL(data, {
    type: 'image/png',
    width: mergedOptions.width,
    margin: mergedOptions.margin,
    color: mergedOptions.color,
    errorCorrectionLevel: 'H',
  });

  return dataUrl;
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(
  data: string,
  options?: QRCodeOptions
): Promise<string> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const svg = await QRCode.toString(data, {
    type: 'svg',
    width: mergedOptions.width,
    margin: mergedOptions.margin,
    color: mergedOptions.color,
    errorCorrectionLevel: 'H',
  });

  return svg;
}
