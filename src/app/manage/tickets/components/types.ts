import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

// Shared ticket types
export interface TicketMessage {
  id: number;
  sender_type: string;
  message: string;
  created_at: Date | string;
  sender?: { name: string; role: string } | null;
}

export interface TicketAttachment {
  id: number;
  file_url: string;
  file_name: string;
}

export interface TicketListItem {
  id: number;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  wallet_address: string;
  created_at: Date | string;
  tag: { code: string };
  brand: { name: string };
  assignee: { name: string } | null;
  _count: { messages: number };
}

export interface TicketFull {
  id: number;
  ticket_number: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  wallet_address: string;
  created_at: Date | string;
  resolved_at: Date | string | null;
  tag: {
    code: string;
    nft: { image_url: string } | null;
  };
  brand: { name: string };
  assignee: { id: number; name: string; email: string } | null;
  messages: TicketMessage[];
  attachments: TicketAttachment[];
}

export interface Product {
  id: number;
  code: string;
  metadata: unknown;
}

// Status configuration
export const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    icon: typeof Clock;
    bgColor: string;
    textColor: string;
    barColor: string;
  }
> = {
  open: {
    label: 'Dibuka',
    variant: 'default',
    icon: AlertCircle,
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    barColor: '#fbbf24',
  },
  in_progress: {
    label: 'Diproses',
    variant: 'secondary',
    icon: Clock,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    barColor: '#3b82f6',
  },
  resolved: {
    label: 'Selesai',
    variant: 'outline',
    icon: CheckCircle,
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    barColor: '#10b981',
  },
  closed: {
    label: 'Ditutup',
    variant: 'outline',
    icon: CheckCircle,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    barColor: '#9ca3af',
  },
};

// Priority configuration
export const PRIORITY_CONFIG: Record<
  string,
  { label: string; dotColor: string; textColor: string }
> = {
  low: { label: 'Rendah', dotColor: 'bg-gray-400', textColor: 'text-gray-600' },
  normal: {
    label: 'Normal',
    dotColor: 'bg-blue-500',
    textColor: 'text-blue-600',
  },
  high: {
    label: 'Tinggi',
    dotColor: 'bg-orange-500',
    textColor: 'text-orange-600',
  },
  urgent: {
    label: 'Mendesak',
    dotColor: 'bg-red-500',
    textColor: 'text-red-600',
  },
};

// Category labels
export const CATEGORY_LABELS: Record<string, string> = {
  defect: 'Cacat Produk',
  quality: 'Masalah Kualitas',
  missing_parts: 'Bagian Hilang',
  warranty: 'Klaim Garansi',
  other: 'Lainnya',
};
