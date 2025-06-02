'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LoadingCat from '../components/LoadingCat';

interface User {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  profilePhoto?: string;
}

export default function Students() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/get-users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 mt-16">
          <LoadingCat message="در حال دریافت اطلاعات دانشجویان..." />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Animated background effect */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/50 to-white"></div>
      </div>

      <Navbar />

      {/* Main Content */}
      <div className="relative z-10 flex-grow px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-medium mb-2 block">دانشجویان</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              دانشجویان علوم کامپیوتر
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto mb-8"></div>
          </div>

          {/* Users Grid */}
          {error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                      {user.profilePhoto ? (
                        <img
                          src={user.profilePhoto}
                          alt={`${user.name} ${user.lastName}`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <svg
                          className="w-12 h-12 text-emerald-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {user.name} {user.lastName}
                    </h3>
                    <p className="text-gray-600 text-center">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
  );
}