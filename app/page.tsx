'use client';

import Navbar from './components/Navbar';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { isLoggedIn, onAuthStateChange } from './utils/auth';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Initial auth check
    setIsAuthenticated(isLoggedIn());

    // Listen for auth state changes
    const unsubscribe = onAuthStateChange(() => {
      setIsAuthenticated(isLoggedIn());
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Animated background effect */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/50 to-white"></div>
      </div>

      <Navbar />

      {/* Hero Section */}
      <div className="relative z-10 flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Column: Text Content */}
            <div className="space-y-8">
              <div className="inline-block">
                <div className="relative">
                  <span className="text-emerald-600 font-medium mb-2 block">به انجمن علوم کامپیوتر خوش آمدید</span>
                  <h1 className="text-4xl md:text-5xl font-bold leading-[1.4] md:leading-[1.3] text-gray-900">
                    انجمن علوم کامپیوتر دانشگاه بناب
                  </h1>
                  <div className="absolute -bottom-4 w-32 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                </div>
              </div>

              <p className="text-xl text-gray-600 leading-relaxed">
                وب‌سایت انجمن علوم کامپیوتر دانشگاه بناب در حال آماده‌سازی است. به زودی با امکانات جدید و پیشرفته در خدمت دانشجویان و علاقه‌مندان به علوم کامپیوتر خواهیم بود.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Link href="/dashboard" 
                    className="group flex items-center justify-center bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300">
                    <i className="fas fa-columns text-xl ml-2 group-hover:scale-110 transition-transform"></i>
                    <span className="font-medium">پنل کاربری</span>
                  </Link>
                ) : (
                  <Link href="/login" 
                    className="group flex items-center justify-center bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300">
                    <i className="fas fa-sign-in-alt text-xl ml-2 group-hover:scale-110 transition-transform"></i>
                    <span className="font-medium">ورود به حساب</span>
                  </Link>
                )}
                <a href="https://t.me/+XJNJRg6Md7FmNjI8" 
                  className="group flex items-center justify-center bg-white text-emerald-700 px-8 py-4 rounded-xl hover:bg-emerald-50 transition-all duration-300 border border-emerald-200">
                  <i className="fab fa-telegram text-xl ml-2 group-hover:scale-110 transition-transform"></i>
                  <span className="font-medium">گروه تلگرام</span>
                </a>
              </div>
            </div>

            {/* Right Column: Hero Image */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-3xl"></div>
                <div className="relative transform hover:scale-102 transition-transform duration-700">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/50 to-transparent rounded-3xl animate-pulse duration-3000"></div>
                  <img
                    src="/hero.svg"
                    alt="Hero illustration"
                    className="relative w-full h-auto max-w-lg rounded-3xl"
                    style={{
                      filter: 'drop-shadow(0 20px 40px rgba(16, 185, 129, 0.15))'
                    }}
                  />
                  <div className="absolute -bottom-2 inset-x-0 h-10 bg-gradient-to-t from-white to-transparent"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-32">
            {/* Section Title */}
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                امکانات و خدمات انجمن
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto mb-6"></div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                ما با ارائه خدمات متنوع و کاربردی، به دنبال ارتقای سطح علمی و مهارتی دانشجویان هستیم
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group bg-white rounded-xl p-6 border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-laptop-code text-white text-xl"></i>
                </div>
                <h3 className="font-bold text-xl mb-4 text-gray-900">برنامه‌نویسی پیشرفته</h3>
                <p className="text-gray-600">دوره‌های تخصصی برنامه‌نویسی، هوش مصنوعی، و یادگیری ماشین برای دانشجویان</p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-white rounded-xl p-6 border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-project-diagram text-white text-xl"></i>
                </div>
                <h3 className="font-bold text-xl mb-4 text-gray-900">پروژه‌های تحقیقاتی</h3>
                <p className="text-gray-600">مشارکت در پروژه‌های تحقیقاتی و توسعه در حوزه‌های نوین فناوری اطلاعات</p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-white rounded-xl p-6 border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-users text-white text-xl"></i>
                </div>
                <h3 className="font-bold text-xl mb-4 text-gray-900">رویدادهای علمی</h3>
                <p className="text-gray-600">برگزاری سمینارها، کارگاه‌ها و مسابقات تخصصی در حوزه علوم کامپیوتر</p>
              </div>
            </div>
          </div>

          {/* Pages Section */}
          <div className="mt-32">
            {/* Section Title */}
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                صفحات مهم
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto mb-6"></div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                دسترسی سریع به بخش‌های مختلف سایت
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Community Page Card */}
              <Link href={isAuthenticated ? "/community" : "/login"} 
                className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-comments text-white text-3xl"></i>
                </div>
                <h3 className="font-bold text-2xl mb-4 text-gray-900 group-hover:text-emerald-600 transition-colors">انجمن گفتگو</h3>
                <p className="text-gray-600 mb-6">مکانی برای بحث و تبادل نظر با دیگر دانشجویان و اساتید در مورد موضوعات مختلف علوم کامپیوتر</p>
                <span className="inline-flex items-center text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                  {isAuthenticated ? 'مشاهده انجمن' : 'ورود به حساب'}
                  <svg className="w-5 h-5 mr-2 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>

              {/* Students Page Card */}
              <Link href={isAuthenticated ? "/students" : "/login"}
                className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fas fa-users text-white text-3xl"></i>
                </div>
                <h3 className="font-bold text-2xl mb-4 text-gray-900 group-hover:text-emerald-600 transition-colors">دانشجویان علوم کامپیوتر</h3>
                <p className="text-gray-600 mb-6">مشاهده لیست دانشجویان رشته علوم کامپیوتر و اطلاعات تحصیلی آنها</p>
                <span className="inline-flex items-center text-emerald-600 font-medium group-hover:translate-x-2 transition-transform">
                  {isAuthenticated ? 'مشاهده دانشجویان' : 'ورود به حساب'}
                  <svg className="w-5 h-5 mr-2 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="mt-32 mb-20">
            <div className="bg-gradient-to-r from-emerald-50 via-emerald-100/50 to-emerald-50 rounded-3xl p-12">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                  {isAuthenticated ? 
                    'به پنل کاربری خود دسترسی داشته باشید' :
                    'همین حالا به جمع ما بپیوندید'
                  }
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  {isAuthenticated ?
                    'مدیریت حساب کاربری، مشاهده دوره‌ها و دسترسی به امکانات ویژه' :
                    'با عضویت در سایت انجمن علوم کامپیوتر، به تمامی امکانات دسترسی خواهید داشت'
                  }
                </p>
                
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl shadow-lg"
                  >
                    <i className="fas fa-columns text-xl ml-2"></i>
                    پنل کاربری
                  </Link>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/login"
                      className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl shadow-lg"
                    >
                      <i className="fas fa-sign-in-alt text-xl ml-2"></i>
                      ورود به حساب
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center px-8 py-4 text-lg font-medium text-emerald-700 bg-emerald-100 rounded-xl hover:bg-emerald-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl shadow-lg"
                    >
                      <i className="fas fa-user-plus text-xl ml-2"></i>
                      ثبت‌نام
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-20 bg-white py-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0 space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center">
                <i className="fas fa-microchip text-xl text-white"></i>
              </div>
              <span className="text-gray-900 font-bold">انجمن علوم کامپیوتر دانشگاه بناب</span>
            </div>

            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} - تمامی حقوق محفوظ است
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
