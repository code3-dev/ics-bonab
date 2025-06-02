'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingCat from '../components/LoadingCat';
import Navbar from '../components/Navbar';

interface User {
  id: string;
  name: string;
  lastName: string;
  studentId: string;
  email: string;
  phone: string;
  nationalId: string;
  photo?: string;
  photoContentType?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    studentId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const fetchUserPhoto = async (token: string) => {
    try {
      const response = await fetch('/api/user/photo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.photo) {
          setUser(prev => prev ? { ...prev, photo: data.photo, photoContentType: data.contentType } : null);
        }
      }
    } catch (error) {
      console.error('Error fetching user photo:', error);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('فرمت فایل پشتیبانی نمی‌شود');
      return;
    }

    // Check file size (3MB)
    if (file.size > 3 * 1024 * 1024) {
      setPhotoError('حجم فایل نباید بیشتر از ۳ مگابایت باشد');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedPhoto(reader.result as string);
      setPhotoError('');
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhoto) return;
    setPhotoLoading(true);
    setPhotoError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          photo: selectedPhoto,
          contentType: selectedPhoto.split(';')[0].split(':')[1]
        })
      });

      const data = await response.json();
      if (response.ok) {
        setUser(prev => prev ? { ...prev, photo: selectedPhoto } : null);
        setSelectedPhoto(null);
        setUpdateMessage('عکس پروفایل با موفقیت به‌روزرسانی شد');
        // Auto-hide message after 5 seconds
        setTimeout(() => {
          setUpdateMessage('');
        }, 5000);
      } else {
        setPhotoError(data.message || 'خطا در به‌روزرسانی عکس پروفایل');
        // Auto-hide error message after 5 seconds
        setTimeout(() => {
          setPhotoError('');
        }, 5000);
      }
    } catch (error) {
      setPhotoError('خطا در ارتباط با سرور');
      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setPhotoError('');
      }, 5000);
    } finally {
      setPhotoLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          setEditFormData(data.user);
          await fetchUserPhoto(token);
        } else {
          if (data.message === 'توکن نامعتبر است') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
            return;
          }
          throw new Error(data.message);
        }
      } catch (err) {
        setError('خطا در دریافت اطلاعات کاربر');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUpdateMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      const data = await response.json();

      if (response.ok) {
        setUpdateMessage('اطلاعات با موفقیت به‌روزرسانی شد');
        // Preserve the photo when updating user info
        setUser(prev => ({
          ...editFormData,
          id: prev?.id || '',
          photo: prev?.photo,
          photoContentType: prev?.photoContentType
        }));
      } else {
        setUpdateMessage(data.message || 'خطا در به‌روزرسانی اطلاعات');
      }
    } catch (error) {
      setUpdateMessage('خطا در ارتباط با سرور');
    } finally {
      setIsSubmitting(false);
      // Auto-hide message after 5 seconds
      setTimeout(() => {
        setUpdateMessage('');
      }, 5000);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    setUpdateMessage('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 mt-16">
          <LoadingCat message="در حال بارگذاری پنل کاربری..." />
      </div>
      </main>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse hover:opacity-75 transition">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <i className="fas fa-microchip text-lg text-white"></i>
                </div>
                <span className="font-bold text-gray-900">انجمن علوم کامپیوتر</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center text-gray-700 hover:text-red-600 transition-colors"
              >
                <i className="fas fa-sign-out-alt text-xl ml-2"></i>
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="relative h-32 bg-gradient-to-r from-emerald-400 to-emerald-600">
                <div className="absolute -bottom-12 inset-x-0 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-white p-1">
                    {user.photo ? (
                      <img
                        src={user.photo}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center">
                        <i className="fas fa-user text-3xl text-white"></i>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-16 pb-6 px-6">
                <h2 className="text-xl font-bold text-center text-gray-900">{`${user?.name} ${user?.lastName}`}</h2>
                <p className="text-emerald-600 text-sm text-center mt-1">دانشجوی علوم کامپیوتر</p>
                <div className="mt-6 flex flex-col space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <i className="fas fa-user-circle text-xl ml-3"></i>
                    <span>مشخصات</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('photo')}
                    className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                      activeTab === 'photo'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <i className="fas fa-camera text-xl ml-3"></i>
                    <span>عکس پروفایل</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('edit')}
                    className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                      activeTab === 'edit'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <i className="fas fa-edit text-xl ml-3"></i>
                    <span>ویرایش اطلاعات</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('courses')}
                    className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                      activeTab === 'courses'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <i className="fas fa-graduation-cap text-xl ml-3"></i>
                    <span>دوره‌های من</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                      activeTab === 'notifications'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <i className="fas fa-bell text-xl ml-3"></i>
                    <span>اعلان‌ها</span>
                  </button>
                  <Link
                    href="/community"
                    className="flex items-center px-4 py-3 rounded-xl transition-colors text-gray-600 hover:bg-gray-50"
                  >
                    <i className="fas fa-comments text-xl ml-3"></i>
                    <span>انجمن گفتگو</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Edit Tab */}
            {activeTab === 'edit' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">ویرایش اطلاعات</h2>
                {updateMessage && (
                  <div className={`p-4 rounded-xl mb-6 ${
                    updateMessage.includes('موفقیت') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {updateMessage}
                  </div>
                )}
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">نام</label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">نام خانوادگی</label>
                      <input
                        type="text"
                        name="lastName"
                        value={editFormData.lastName}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">شماره دانشجویی</label>
                      <input
                        type="text"
                        name="studentId"
                        value={editFormData.studentId}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">کد ملی</label>
                      <input
                        type="text"
                        name="nationalId"
                        value={editFormData.nationalId}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">شماره تماس</label>
                      <input
                        type="tel"
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ایمیل</label>
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleEditChange}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">اطلاعات پروفایل</h3>
                </div>
                <div id="profile-details" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">نام</p>
                    <p className="text-gray-900">{user.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">نام خانوادگی</p>
                    <p className="text-gray-900">{user.lastName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">شماره دانشجویی</p>
                    <p className="text-gray-900">{user.studentId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">کد ملی</p>
                    <p className="text-gray-900">{user.nationalId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">ایمیل</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">شماره تماس</p>
                    <p className="text-gray-900">{user.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Photo Tab */}
            {activeTab === 'photo' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">ویرایش عکس پروفایل</h3>
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-emerald-100">
                      {selectedPhoto ? (
                        <img
                          src={selectedPhoto}
                          alt="Selected profile"
                          className="w-full h-full object-cover"
                        />
                      ) : user?.photo ? (
                        <img
                          src={user.photo}
                          alt="Current profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center">
                          <i className="fas fa-user text-5xl text-white"></i>
                        </div>
                      )}
                    </div>
                  </div>

                  {photoError && (
                    <div className="text-red-500 text-center">{photoError}</div>
                  )}

                  <div className="flex flex-col items-center space-y-4">
                    <label className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-xl cursor-pointer hover:bg-emerald-100 transition-colors">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                      <i className="fas fa-upload ml-2"></i>
                      انتخاب عکس
                    </label>

                    {selectedPhoto && (
                      <button
                        onClick={handlePhotoUpload}
                        disabled={photoLoading}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {photoLoading ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white ml-2"></div>
                            در حال آپلود...
                          </span>
                        ) : (
                          <>
                            <i className="fas fa-save ml-2"></i>
                            ذخیره عکس
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="text-sm text-gray-500 text-center">
                    <p>فرمت‌های مجاز: PNG، JPG، JPEG، WebP</p>
                    <p>حداکثر حجم مجاز: ۳ مگابایت</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">دوره‌های در حال برگزاری</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="w-12 h-12 rounded-xl bg-gray-500 flex items-center justify-center mb-4">
                        <i className="fas fa-code text-xl text-white"></i>
                      </div>
                      <h3 className="font-bold text-gray-900">برنامه‌نویسی پیشرفته</h3>
                      <p className="text-gray-600 text-sm mt-2">به زودی</p>
                      <div className="mt-4 flex items-center text-sm text-gray-600">
                        <i className="fas fa-clock ml-2"></i>
                        <span>در انتظار شروع</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="w-12 h-12 rounded-xl bg-gray-500 flex items-center justify-center mb-4">
                        <i className="fas fa-brain text-xl text-white"></i>
                      </div>
                      <h3 className="font-bold text-gray-900">هوش مصنوعی</h3>
                      <p className="text-gray-600 text-sm mt-2">به زودی</p>
                      <div className="mt-4 flex items-center text-sm text-gray-600">
                        <i className="fas fa-clock ml-2"></i>
                        <span>در انتظار شروع</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">دوره‌های آینده</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-gray-200 rounded-xl hover:border-emerald-200 transition-colors">
                      <h3 className="font-medium text-gray-900">یادگیری ماشین</h3>
                      <p className="text-gray-600 text-sm mt-1">ترم آینده</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-xl hover:border-emerald-200 transition-colors">
                      <h3 className="font-medium text-gray-900">شبکه‌های کامپیوتری</h3>
                      <p className="text-gray-600 text-sm mt-1">ترم آینده</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-xl hover:border-emerald-200 transition-colors">
                      <h3 className="font-medium text-gray-900">امنیت شبکه</h3>
                      <p className="text-gray-600 text-sm mt-1">ترم آینده</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">اعلان‌ها</h2>
                <div className="space-y-4">
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-emerald-900">ثبت‌نام شما تایید شد</h3>
                    </div>
                    <p className="text-emerald-700 text-sm mt-2">به انجمن علوم کامپیوتر خوش آمدید!</p>
                  </div>
                </div>
              </div>
            )}
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
    </main>
  );
}