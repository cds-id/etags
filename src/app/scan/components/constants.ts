// Human-readable labels for constants
export const COUNTRY_LABELS: Record<string, string> = {
  ID: 'Indonesia',
  SG: 'Singapura',
  MY: 'Malaysia',
  TH: 'Thailand',
  VN: 'Vietnam',
  PH: 'Filipina',
  GLOBAL: 'Global (Seluruh Dunia)',
};

export const CHANNEL_LABELS: Record<string, string> = {
  official_store: 'Toko Resmi',
  authorized_retailer: 'Retailer Resmi',
  online_marketplace: 'Marketplace Online',
  distributor: 'Distributor',
  direct_sales: 'Penjualan Langsung',
};

export const MARKET_LABELS: Record<string, string> = {
  domestic: 'Domestik',
  export: 'Ekspor',
  global: 'Global',
  southeast_asia: 'Asia Tenggara',
};

// Helper to get human-readable label
export const getCountryLabel = (code?: string) =>
  code ? COUNTRY_LABELS[code] || code : undefined;
export const getChannelLabel = (code?: string) =>
  code ? CHANNEL_LABELS[code] || code : undefined;
export const getMarketLabel = (code?: string) =>
  code ? MARKET_LABELS[code] || code : undefined;

export type LocationData = {
  latitude: number;
  longitude: number;
  locationName?: string;
};
