'use client';

import {
  Rocket,
  Building2,
  User,
  Link,
  Shield,
  Wrench,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FAQCategory } from '@/lib/faq-data';

type FAQCategoryCardProps = {
  category: FAQCategory;
  isActive: boolean;
  onClick: () => void;
  itemCount: number;
};

const iconMap: Record<string, React.ReactNode> = {
  rocket: <Rocket className="h-5 w-5" />,
  building: <Building2 className="h-5 w-5" />,
  user: <User className="h-5 w-5" />,
  link: <Link className="h-5 w-5" />,
  shield: <Shield className="h-5 w-5" />,
  wrench: <Wrench className="h-5 w-5" />,
};

export function FAQCategoryCard({
  category,
  isActive,
  onClick,
  itemCount,
}: FAQCategoryCardProps) {
  const icon = iconMap[category.icon] || <HelpCircle className="h-5 w-5" />;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all duration-200 w-full',
        isActive
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 shadow-lg shadow-blue-500/10'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          isActive
            ? 'bg-blue-500 text-white'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
        )}
      >
        {icon}
      </div>
      <div>
        <h3
          className={cn(
            'font-semibold',
            isActive
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-slate-700 dark:text-slate-200'
          )}
        >
          {category.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {itemCount} pertanyaan
        </p>
      </div>
    </button>
  );
}
