import { Cat } from 'lucide-react';

export default function LoadingCat({ message = 'در حال بارگذاری...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full animate-ping opacity-20"></div>
        <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-lg">
          <Cat className="w-12 h-12 text-white" />
        </div>
      </div>
      <p className="mt-6 text-lg text-gray-600 font-medium">{message}</p>
      <p className="mt-2 text-sm text-gray-500">لطفاً چند لحظه صبر کنید</p>
    </div>
  );
} 