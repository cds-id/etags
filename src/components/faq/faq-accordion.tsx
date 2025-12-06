'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FAQItem } from '@/lib/faq-data';

type FAQAccordionProps = {
  items: FAQItem[];
  defaultOpen?: string;
};

export function FAQAccordion({ items, defaultOpen }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpen || null);

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <FAQAccordionItem
          key={item.id}
          item={item}
          isOpen={openId === item.id}
          onToggle={() => toggleItem(item.id)}
        />
      ))}
    </div>
  );
}

type FAQAccordionItemProps = {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
};

function FAQAccordionItem({ item, isOpen, onToggle }: FAQAccordionItemProps) {
  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-200',
        isOpen
          ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 shadow-md'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
      )}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            'font-medium transition-colors',
            isOpen
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-slate-700 dark:text-slate-200'
          )}
        >
          {item.question}
        </span>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 transition-transform duration-200',
            isOpen
              ? 'rotate-180 text-blue-500'
              : 'text-slate-400 dark:text-slate-500'
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-200',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
