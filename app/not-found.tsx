import { Metadata } from 'next'
import { Command } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 rtl">
      <Command className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold text-center text-white">صفحه مورد نظر یافت نشد</h1>
      <p className="text-center text-gray-400 mb-4">متاسفانه، صفحه‌ای که به دنبال آن هستید وجود ندارد.</p>
      <a href="/" className="text-blue-500 hover:underline">بازگشت به صفحه اصلی</a>
    </div>
  )
}