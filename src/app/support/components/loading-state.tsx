'use client';

export function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#2B4C7E]/5 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#2B4C7E]/20 border-t-[#2B4C7E] animate-spin mx-auto mb-4" />
        <p className="text-[#808080] font-medium">Memuat produk Anda...</p>
      </div>
    </div>
  );
}
