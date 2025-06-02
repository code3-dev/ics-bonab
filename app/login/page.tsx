'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { isLoggedIn } from '../utils/auth';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    studentId: '',
    nationalId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoggedIn()) {
      const redirectUrl = searchParams.get('url');
      if (redirectUrl) {
        if (redirectUrl === 'home') {
          router.push('/');
        } else {
          router.push(`/${redirectUrl}`);
        }
      } else {
        router.push('/dashboard');
      }
    }
  }, [router, searchParams]);

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
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        const redirectUrl = searchParams.get('url');
        if (redirectUrl) {
          if (redirectUrl === 'home') {
            router.push('/');
          } else {
            router.push(`/${redirectUrl}`);
          }
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.message || 'نام کاربری یا رمز عبور اشتباه است');
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

      <div className="relative z-10 flex-grow flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-8 hover:opacity-80 transition-opacity">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto">
                <i className="fas fa-microchip text-3xl text-white"></i>
              </div>
            </Link>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">
              ورود به پنل کاربری
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
                  type="password"
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

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative group inline-flex items-center"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                  <div className="relative flex items-center bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-8 py-3 rounded-lg group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? (
                      <span>در حال ورود...</span>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt text-xl ml-2 group-hover:scale-110 transition-transform"></i>
                        <span className="font-medium">ورود به سایت</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                حساب کاربری ندارید؟{' '}
                <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  ثبت‌نام کنید
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}