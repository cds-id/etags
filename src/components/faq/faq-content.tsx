'use client';

import { useState, useMemo } from 'react';
import { FAQSearch } from './faq-search';
import { FAQCategoryCard } from './faq-category-card';
import { FAQAccordion } from './faq-accordion';
import { faqData, searchFAQ } from '@/lib/faq-data';
import { FileQuestion } from 'lucide-react';

export function FAQContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(faqData[0].id);

  const filteredData = useMemo(() => {
    return searchFAQ(searchQuery);
  }, [searchQuery]);

  const totalResults = useMemo(() => {
    return filteredData.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [filteredData]);

  const currentCategory = useMemo(() => {
    if (searchQuery) {
      return null;
    }
    return filteredData.find((cat) => cat.id === activeCategory);
  }, [filteredData, activeCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
          Pusat Bantuan
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Temukan jawaban untuk pertanyaan umum tentang penggunaan Etags, cara
          scan produk, dan panduan untuk brand.
        </p>
      </div>

      <FAQSearch
        value={searchQuery}
        onChange={setSearchQuery}
        resultCount={searchQuery ? totalResults : undefined}
      />

      {/* Category Cards - Hidden when searching */}
      {!searchQuery && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {faqData.map((category) => (
            <FAQCategoryCard
              key={category.id}
              category={category}
              isActive={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
              itemCount={category.items.length}
            />
          ))}
        </div>
      )}

      {/* FAQ Items */}
      <div className="max-w-3xl mx-auto">
        {searchQuery ? (
          // Search Results
          filteredData.length > 0 ? (
            <div className="space-y-8">
              {filteredData.map((category) => (
                <div key={category.id}>
                  <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    {category.title}
                  </h2>
                  <FAQAccordion items={category.items} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <FileQuestion className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">
                Tidak ada hasil ditemukan
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Coba kata kunci lain atau jelajahi kategori di atas.
              </p>
            </div>
          )
        ) : (
          // Category View
          currentCategory && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  {currentCategory.title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  {currentCategory.description}
                </p>
              </div>
              <FAQAccordion
                items={currentCategory.items}
                defaultOpen={currentCategory.items[0]?.id}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}
