'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isLoggedIn } from '../utils/auth';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    studentId: '',
    nationalId: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoggedIn()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
      } else {
        setError(data.message || 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.');
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Animated background effect */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/50 to-white"></div>
      </div>

      <div className="relative z-10 flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-8 hover:opacity-80 transition-opacity">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto">
                <i className="fas fa-microchip text-3xl text-white"></i>
              </div>
            </Link>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">
              ثبت‌نام در سایت
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto mb-6"></div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium" htmlFor="name">
                    نام
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="نام"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium" htmlFor="lastName">
                    نام خانوادگی
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="نام خانوادگی"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium" htmlFor="studentId">
                  شماره دانشجویی
                </label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  required
                  value={formData.studentId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="شماره دانشجویی خود را وارد کنید"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium" htmlFor="nationalId">
                  کد ملی
                </label>
                <input
                  type="text"
                  id="nationalId"
                  name="nationalId"
                  required
                  value={formData.nationalId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="کد ملی خود را وارد کنید"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium" htmlFor="email">
                  ایمیل
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="ایمیل خود را وارد کنید"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium" htmlFor="phone">
                  شماره موبایل
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="09xxxxxxxxx"
                  dir="ltr"
                  pattern="^(\+98|0)?9\d{9}$"
                  title="شماره موبایل باید با 09 شروع شود و 11 رقم باشد"
                />
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative group inline-flex items-center"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                  <div className="relative flex items-center bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-8 py-3 rounded-lg group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? (
                      <span>در حال ثبت‌نام...</span>
                    ) : (
                      <>
                        <i className="fas fa-user-plus text-xl ml-2 group-hover:scale-110 transition-transform"></i>
                        <span className="font-medium">ثبت‌نام</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                قبلاً ثبت‌نام کرده‌اید؟{' '}
                <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  وارد شوید
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}