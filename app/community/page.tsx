'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isLoggedIn } from '../utils/auth';
import Navbar from '../components/Navbar';
import { Cat } from 'lucide-react';

interface Post {
  _id: string;
  title: string;
  content: string;
  category: 'general' | 'question' | 'discussion' | 'technical' | 'announcement';
  userId: string;
  userName: string;
  userPhoto?: string;
  createdAt: string;
  replyCount: number;
}

interface Reply {
  _id: string;
  content: string;
  userId: string;
  userName: string;
  createdAt: string;
  parentId?: string;
  replies: Reply[];
}

// Add category mapping constant
const CATEGORY_MAP = {
  general: 'عمومی',
  question: 'سوال',
  discussion: 'بحث و گفتگو',
  technical: 'فنی',
  announcement: 'اطلاعیه'
} as const;

const CATEGORY_STYLES = {
  technical: 'bg-blue-100 text-blue-800 group-hover:bg-blue-200 group-hover:shadow-inner',
  question: 'bg-yellow-100 text-yellow-800 group-hover:bg-yellow-200 group-hover:shadow-inner',
  discussion: 'bg-purple-100 text-purple-800 group-hover:bg-purple-200 group-hover:shadow-inner',
  announcement: 'bg-red-100 text-red-800 group-hover:bg-red-200 group-hover:shadow-inner',
  general: 'bg-emerald-100 text-emerald-800 group-hover:bg-emerald-200 group-hover:shadow-inner'
} as const;

export default function Community() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [showNavFooter, setShowNavFooter] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [userPhotos, setUserPhotos] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = isLoggedIn();
      setIsAuthenticated(isAuth);
      if (!isAuth) return;

      try {
        await fetchPosts();
      } catch (err) {
        setError('خطا در دریافت پست‌ها');
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchUserPhotos = async (posts: Post[]) => {
    try {
      // Collect unique user IDs from all posts
      const userIds = new Set<string>();
      posts.forEach(post => userIds.add(post.userId));

      const userIdsArray = Array.from(userIds);
      console.log('Sending userIds to photos API:', userIdsArray);

      // Fetch photos for all users
      const response = await fetch('/api/users/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userIds: userIdsArray })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Photos API response:', data);
        if (data.success) {
          const photoMap: {[key: string]: string} = {};
          data.photos.forEach((photo: any) => {
            photoMap[photo.userId] = photo.photo;
          });
          setUserPhotos(photoMap);
        }
      }
    } catch (err) {
      console.error('Error fetching user photos:', err);
    }
  };

  const fetchPosts = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/posts?page=${page}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch posts');
    
    const data = await response.json();
    setPosts(prev => page === 1 ? data.posts : [...prev, ...data.posts]);
    setHasMore(data.hasMore);
    // Fetch user photos after posts are loaded
    await fetchUserPhotos(data.posts);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingPost) return;
    
    setIsCreatingPost(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPost)
      });

      if (response.ok) {
        setNewPost({ title: '', content: '', category: 'general' });
        setShowNewPostForm(false);
        setShowNavFooter(true);
        await fetchPosts();
      }
    } catch (err) {
      setError('خطا در ایجاد پست');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchPosts();
  };

  const renderUserAvatar = (userId: string, userName: string) => (
    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-lg overflow-hidden">
      {userPhotos[userId] ? (
        <img src={userPhotos[userId]} alt={userName} className="w-full h-full object-cover" />
      ) : (
        userName[0]
      )}
    </div>
  );

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white">
        {/* Animated background effect */}
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/50 to-white"></div>
        </div>

        {showNavFooter && <Navbar />}

        <div className="relative z-10 flex-grow flex items-center justify-center p-4">
          <div className="w-full max-w-4xl text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gray-900 tracking-tight">انجمن گفتگوی دانشجویی</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">مکانی برای به اشتراک‌گذاری دانش، طرح سوالات و تعامل با سایر دانشجویان</p>
            </div>
            <Link
              href="/login?url=community"
              className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              ورود به انجمن
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Footer */}
        {showNavFooter && <footer className="relative z-10 mt-20 bg-white py-8 border-t border-gray-100">
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
        </footer>}
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

      {showNavFooter && <Navbar />}

      <div className="relative z-10 flex-grow px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
            <span className="text-emerald-600 font-medium mb-2 block">انجمن گفتگو</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">به انجمن گفتگو خوش آمدید</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">به اشتراک‌گذاری دانش و تجربیات خود با دیگر دانشجویان</p>
            <button
              onClick={() => {
                setShowNewPostForm(true);
                setShowNavFooter(false);
              }}
              className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              ایجاد پست جدید
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* New Post Modal */}
          {showNewPostForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 ease-in-out">
              <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:rounded-2xl md:max-w-3xl overflow-hidden shadow-2xl transform transition-all duration-300 ease-in-out">
                <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">ایجاد پست جدید</h2>
                  <button
                    onClick={() => {
                       if (!isCreatingPost) {
                         setShowNewPostForm(false);
                         setShowNavFooter(true);
                       }
                     }}
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-300 disabled:opacity-50"
                    disabled={isCreatingPost}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(100vh-80px)] md:max-h-[calc(90vh-80px)]">
                  <form onSubmit={handleCreatePost} className="space-y-6">
                  <div className="space-y-4">
                      <div className="relative">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">عنوان پست</label>
                        <input
                          id="title"
                          type="text"
                          placeholder="عنوان پست خود را وارد کنید"
                          value={newPost.title}
                          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                          disabled={isCreatingPost}
                        />
                      </div>

                      <div className="relative">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
                        <select
                          id="category"
                          value={newPost.category}
                          onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white"
                          disabled={isCreatingPost}
                        >
                          <option value="general">عمومی</option>
                          <option value="question">سوال</option>
                          <option value="discussion">بحث و گفتگو</option>
                          <option value="technical">فنی</option>
                          <option value="announcement">اطلاعیه</option>
                        </select>
                      </div>

                      <div className="relative">
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">محتوای پست</label>
                        <textarea
                          id="content"
                          placeholder="محتوای پست خود را وارد کنید"
                          value={newPost.content}
                          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                          rows={6}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                          disabled={isCreatingPost}
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          type="submit"
                          disabled={isCreatingPost || !newPost.title || !newPost.content}
                          className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          {isCreatingPost ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              در حال ایجاد پست...
                            </>
                          ) : (
                            'ایجاد پست'
                          )}
                        </button>
                      </div>

                  </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full animate-ping opacity-20"></div>
                <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-lg">
                  <Cat className="w-12 h-12 text-white" />
                </div>
              </div>
              <p className="mt-6 text-lg text-gray-600 font-medium">در حال بارگذاری پست‌ها...</p>
              <p className="mt-2 text-sm text-gray-500">لطفاً چند لحظه صبر کنید</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-lg text-red-600 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              >
                تلاش مجدد
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-xl text-gray-900 font-semibold">هنوز پستی ایجاد نشده است</p>
              <p className="mt-2 text-gray-500">اولین نفری باشید که پستی ایجاد می‌کند</p>
              <button
                onClick={() => {
                  setShowNewPostForm(true);
                  setShowNavFooter(false);
                }}
                className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                ایجاد اولین پست
              </button>
            </div>
          ) : (
            /* Posts Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => (
                <Link
                  href={`/community/${post._id}`}
                  key={post._id}
                  className="group bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-1 hover:bg-gradient-to-b hover:from-white hover:to-emerald-50/30"
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-sm px-4 py-2 rounded-full font-medium transition-all duration-300 ${CATEGORY_STYLES[post.category]}`}>
                        {CATEGORY_MAP[post.category]}
                      </span>
                      <span className="text-sm text-gray-500 group-hover:text-emerald-600 transition-colors">{new Date(post.createdAt).toLocaleDateString('fa-IR')}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">{post.title}</h3>
                    <p className="text-gray-600 line-clamp-3 group-hover:text-gray-700 transition-colors">{post.content}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100 group-hover:border-emerald-100 transition-colors">
                    <div className="flex items-center gap-2">
                      {renderUserAvatar(post.userId, post.userName)}
                      <span className="text-gray-600 group-hover:text-emerald-600 transition-colors">{post.userName}</span>
                    </div>
                    <div className="flex items-center text-gray-500 group-hover:text-emerald-600 transition-colors">
                      <span>{post.replyCount} پاسخ</span>
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Load More Button - Only show when not loading and has more posts */}
          {!loading && hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={loadMore}
                className="inline-flex items-center px-8 py-4 text-lg font-medium text-emerald-600 bg-emerald-100 rounded-full hover:bg-emerald-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    در حال بارگذاری...
                  </>
                ) : (
                  <>
                    بارگذاری بیشتر
                    <svg className="w-5 h-5 mr-2 transition-transform group-hover:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {showNavFooter && <footer className="relative z-10 mt-20 bg-white py-8 border-t border-gray-100">
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
      </footer>}
    </main>
  );
}