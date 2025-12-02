import { type LucideIcon } from 'lucide-react';

export type OnboardingStatusType = {
  step: number;
  complete: boolean;
  hasBrand?: boolean;
  hasProduct?: boolean;
  hasTag?: boolean;
  brandId?: number;
  brandName?: string;
  productId?: number;
};

export type ProductOption = {
  id: number;
  code: string;
  name: string;
};

export type StepConfig = {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
};
