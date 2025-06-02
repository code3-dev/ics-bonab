'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { isLoggedIn, getUser, logout, emitAuthChange } from '../utils/auth';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsAuthenticated(isLoggedIn());
    setUser(getUser());

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Prevent scrolling when mobile menu is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    emitAuthChange();
    // if (pathname === '/') {
    //   window.location.reload();
    // } else {
    //   router.push('/');
    // }
    router.push(`/login?url=${pathname === '/' ? 'home' : pathname.substring(1)}`);
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-white/80 backdrop-blur-lg'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center transform group-hover:scale-105 transition-all duration-300">
                  <i className="fas fa-microchip text-2xl text-white"></i>
                </div>
              </div>
              <Link href="/" className="font-bold text-xl tracking-tight text-gray-900 hover:text-emerald-600 transition-colors duration-300">
                انجمن علوم کامپیوتر
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
              <Link href="/" className="relative group">
                <span className={`transition-colors duration-300 font-medium ${pathname === '/' ? 'text-emerald-600' : isScrolled ? 'text-gray-600' : 'text-gray-900'} group-hover:text-emerald-600`}>
                  خانه
                </span>
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-emerald-500 transition-all duration-300 ${pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
              <Link href="/about" className={`relative group transition-colors duration-300 font-medium ${pathname === '/about' ? 'text-emerald-600' : isScrolled ? 'text-gray-600' : 'text-gray-900'} hover:text-emerald-600`}>
                <span>درباره ما</span>
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-emerald-500 transition-all duration-300 ${pathname === '/about' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
              <Link href="/students" className={`relative group transition-colors duration-300 font-medium ${pathname === '/students' ? 'text-emerald-600' : isScrolled ? 'text-gray-600' : 'text-gray-900'} hover:text-emerald-600`}>
                <span>دانشجویان</span>
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-emerald-500 transition-all duration-300 ${pathname === '/students' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
              <Link href="/community" className={`relative group transition-colors duration-300 font-medium ${pathname === '/community' ? 'text-emerald-600' : isScrolled ? 'text-gray-600' : 'text-gray-900'} hover:text-emerald-600`}>
                <span>انجمن گفتگو</span>
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-emerald-500 transition-all duration-300 ${pathname === '/community' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="group flex items-center bg-white text-emerald-700 px-6 py-2.5 rounded-lg hover:bg-emerald-50 transition-all duration-300 border border-emerald-200"
                  >
                    <i className="fas fa-user text-xl ml-2 group-hover:scale-110 transition-transform"></i>
                    <span className="font-medium">پنل کاربری</span>
                  </Link>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="group flex items-center text-red-600 px-6 py-2.5 rounded-lg hover:bg-red-50 transition-all duration-300 border border-red-200"
                  >
                    <i className="fas fa-sign-out-alt text-xl ml-2 group-hover:scale-110 transition-transform"></i>
                    <span className="font-medium">خروج</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`/login?url=${pathname === '/' ? 'home' : pathname.substring(1)}`}
                    className="group flex items-center bg-white text-emerald-700 px-6 py-2.5 rounded-lg hover:bg-emerald-50 transition-all duration-300 border border-emerald-200"
                  >
                    <i className="fas fa-sign-in-alt text-xl ml-2 group-hover:scale-110 transition-transform"></i>
                    <span className="font-medium">ورود</span>
                  </Link>
                  <Link
                    href="/register"
                    className="group flex items-center bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-6 py-2.5 rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <i className="fas fa-user-plus text-xl ml-2 group-hover:scale-110 transition-transform"></i>
                    <span className="font-medium">ثبت‌نام</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative group inline-flex items-center justify-center p-2 rounded-lg transition-colors duration-300 ${
                  isScrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="sr-only">Open main menu</span>
                {!isOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" aria-hidden="true" />
      )}

      {/* Mobile Menu Panel */}
      <div
        ref={navRef}
        className={`md:hidden fixed inset-y-0 right-0 w-full sm:w-80 z-50 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center">
                <i className="fas fa-microchip text-lg text-white"></i>
              </div>
              <span className="font-bold text-gray-900">انجمن علوم کامپیوتر</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4">
            <div className="flex flex-col space-y-1">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-300 ${pathname === '/' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-100 hover:text-emerald-600'}`}
              >
                <i className="fas fa-home text-xl ml-3"></i>
                <span className="font-medium">خانه</span>
              </Link>
              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-300 ${pathname === '/about' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-100 hover:text-emerald-600'}`}
              >
                <i className="fas fa-info-circle text-xl ml-3"></i>
                <span className="font-medium">درباره ما</span>
              </Link>
              <Link
                href="/students"
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-300 ${pathname === '/students' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-100 hover:text-emerald-600'}`}
              >
                <i className="fas fa-users text-xl ml-3"></i>
                <span className="font-medium">دانشجویان</span>
              </Link>
              <Link
                href="/community"
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-300 ${pathname === '/community' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-100 hover:text-emerald-600'}`}
              >
                <i className="fas fa-comments text-xl ml-3"></i>
                <span className="font-medium">انجمن گفتگو</span>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-emerald-600 transition-colors duration-300"
                  >
                    <i className="fas fa-user text-xl ml-3"></i>
                    <span className="font-medium">پنل کاربری</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="flex items-center px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-300 w-full"
                  >
                    <i className="fas fa-sign-out-alt text-xl ml-3"></i>
                    <span className="font-medium">خروج</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`/login?url=${pathname === '/' ? 'home' : pathname.substring(1)}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-emerald-600 transition-colors duration-300"
                  >
                    <i className="fas fa-sign-in-alt text-xl ml-3"></i>
                    <span className="font-medium">ورود</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-emerald-600 transition-colors duration-300"
                  >
                    <i className="fas fa-user-plus text-xl ml-3"></i>
                    <span className="font-medium">ثبت‌نام</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <h3 className="text-xl font-bold text-gray-900 mb-4">تایید خروج</h3>
            <p className="text-gray-600 mb-6">آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟</p>
            <div className="flex justify-end space-x-4 rtl:space-x-reverse">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                خروج
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}