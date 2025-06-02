'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isLoggedIn } from '../../utils/auth';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

interface Post {
  _id: string;
  title: string;
  content: string;
  category: 'general' | 'question' | 'discussion' | 'technical' | 'announcement';
  userId: string;
  userName: string;
  userPhoto?: string;
  createdAt: string;
  replies: Reply[];
}

interface Reply {
  _id: string;
  content: string;
  userId: string;
  userName: string;
  userPhoto?: string;
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
  technical: 'bg-blue-100 text-blue-800',
  question: 'bg-yellow-100 text-yellow-800',
  discussion: 'bg-purple-100 text-purple-800',
  announcement: 'bg-red-100 text-red-800',
  general: 'bg-emerald-100 text-emerald-800'
} as const;

export default function SinglePost() {
  const router = useRouter();
  const { postId } = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newReply, setNewReply] = useState({ content: '', parentId: '' });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [userPhotos, setUserPhotos] = useState<{[key: string]: string}>({});

  // Add new function to fetch user photos
  const fetchUserPhotos = async (post: Post) => {
    try {
      // Collect all user IDs from post and replies
      const userIds = new Set<string>();
      userIds.add(post.userId);
      
      const collectUserIds = (replies: Reply[]) => {
        replies.forEach(reply => {
          userIds.add(reply.userId);
          if (reply.replies) {
            collectUserIds(reply.replies);
          }
        });
      };
      
      if (post.replies) {
        collectUserIds(post.replies);
      }

      // Fetch photos for all users
      const response = await fetch('/api/users/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userIds: Array.from(userIds) })
      });

      if (response.ok) {
        const data = await response.json();
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

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = isLoggedIn();
      setIsAuthenticated(isAuth);
      if (!isAuth) {
        router.push('/login');
        return;
      }

      try {
        await fetchPost();
      } catch (err) {
        setError('خطا در دریافت پست');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [postId]);

  // Add effect to fetch photos when post is loaded
  useEffect(() => {
    if (post) {
      fetchUserPhotos(post);
    }
  }, [post]);

  const fetchPost = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/posts/${postId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        router.push('/community');
        return;
      }
      throw new Error('Failed to fetch post');
    }
    
    const data = await response.json();
    console.log('API Response:', data); // Debug log
    setPost(data.post);
    setCurrentUserId(data.currentUserId); // Set currentUserId from API response
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`/api/posts/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newReply)
      });

      if (response.ok) {
        setNewReply({ content: '', parentId: '' });
        setReplyingTo(null);
        await fetchPost();
      }
    } catch (err) {
      setError('خطا در ارسال پاسخ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: boolean }>({});

  const toggleReplies = (replyId: string) => {
    setExpandedReplies(prev => ({
      ...prev,
      [replyId]: !prev[replyId]
    }));
  };

  const handleDeleteReply = async (replyId: string, parentId?: string) => {
    if (deletingReplyId || !window.confirm('آیا از حذف این پاسخ اطمینان دارید؟')) {
      return;
    }

    setDeletingReplyId(replyId);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/posts/${postId}/replies/${replyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchPost();
      } else {
        const data = await response.json();
        setError(data.message || 'خطا در حذف پاسخ');
      }
    } catch (err) {
      setError('خطا در حذف پاسخ');
      console.error('Error deleting reply:', err);
    } finally {
      setDeletingReplyId(null);
    }
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

  const renderReplies = (replies: Reply[], level = 0) => {
    return replies.map(reply => (
      <div key={reply._id} className={`mr-${level * 4} sm:mr-${level * 6} mb-6`}>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-emerald-100 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              {renderUserAvatar(reply.userId, reply.userName)}
              <div>
                <div className="font-semibold text-gray-900">{reply.userName}</div>
                <div className="text-sm text-gray-500">{new Date(reply.createdAt).toLocaleDateString('fa-IR')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {reply.replies && reply.replies.length > 0 && (
                <button
                  onClick={() => toggleReplies(reply._id)}
                  className="text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-emerald-50"
                  disabled={isSubmitting || deletingReplyId !== null}
                >
                  {expandedReplies[reply._id] ? (
                    <>
                      <span>مخفی کردن پاسخ‌ها</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>نمایش {reply.replies.length} پاسخ</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReplyingTo(reply._id)}
                  className="text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || deletingReplyId !== null}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span>پاسخ</span>
                </button>
                {currentUserId === reply.userId && (
                  <button
                    onClick={() => handleDeleteReply(reply._id, reply.parentId)}
                    className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting || deletingReplyId !== null}
                  >
                    {deletingReplyId === reply._id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>در حال حذف...</span>
                      </div>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>حذف</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="prose prose-emerald max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
          </div>
        </div>
        {replyingTo === reply._id && (
          <div className="mt-4 mr-4 sm:mr-6">
            <form onSubmit={handleSubmitReply} className="space-y-4">
              <textarea
                value={newReply.content}
                onChange={(e) => setNewReply({ content: e.target.value, parentId: reply._id })}
                placeholder="پاسخ خود را بنویسید..."
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                rows={3}
                required
                disabled={isSubmitting}
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>در حال ارسال...</span>
                    </>
                  ) : (
                    'ارسال پاسخ'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        {reply.replies && reply.replies.length > 0 && expandedReplies[reply._id] && (
          <div className="mt-4">
            {renderReplies(reply.replies, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const handleDeletePost = async () => {
    if (isDeletingPost || isSubmitting || deletingReplyId) return;
    
    if (!window.confirm('آیا از حذف این پست اطمینان دارید؟')) {
      return;
    }

    setIsDeletingPost(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        router.push('/community');
      } else {
        const data = await response.json();
        setError(data.message || 'خطا در حذف پست');
      }
    } catch (err) {
      setError('خطا در حذف پست');
      console.error('Error deleting post:', err);
    } finally {
      setIsDeletingPost(false);
    }
  };

  if (!isAuthenticated) return null;
  if (loading) return <div className="min-h-screen text-gray-50 flex items-center justify-center">در حال بارگذاری...</div>;
  if (error) return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-8 text-red-600">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold mb-2">خطا در بارگذاری پست</h2>
            <p className="text-gray-600 mb-8">{error}</p>
          </div>
          <Link 
            href="/community"
            className="inline-flex items-center px-6 py-3 text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <i className="fas fa-arrow-right ml-2"></i>
            بازگشت به انجمن
          </Link>
        </div>
      </div>
    </main>
  );
  if (!post) return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-8">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">پست مورد نظر یافت نشد</h2>
            <p className="text-gray-600 mb-8">پست مورد نظر شما وجود ندارد یا حذف شده است</p>
          </div>
          <Link 
            href="/community"
            className="inline-flex items-center px-6 py-3 text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <i className="fas fa-arrow-right ml-2"></i>
            بازگشت به انجمن
          </Link>
        </div>
      </div>
    </main>
  );

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Animated background effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/30 to-white/80"></div>
      </div>

      <Navbar />

      <div className="relative z-10 flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 mt-16">
        <div className="max-w-3xl mx-auto">
          {/* Post Header */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100 hover:border-emerald-100 transition-all duration-300 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                {renderUserAvatar(post.userId, post.userName)}
                <div>
                  <div className="font-semibold text-gray-900 text-lg">{post.userName}</div>
                  <div className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString('fa-IR')}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <span className={`text-sm px-4 py-2 rounded-full font-medium ${CATEGORY_STYLES[post.category]}`}>
                  {CATEGORY_MAP[post.category]}
                </span>
                {currentUserId === post.userId && (
                  <button
                    onClick={handleDeletePost}
                    className="group relative px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    disabled={isDeletingPost || isSubmitting || deletingReplyId !== null}
                  >
                    {isDeletingPost ? (
                      <>
                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>در حال حذف...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>حذف پست</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
            <div className="prose prose-emerald max-w-none">
              <p className="text-gray-700 text-base md:text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>
          </div>

          {/* Reply Form */}
          {!replyingTo && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 hover:border-emerald-100 transition-all duration-300 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">ارسال پاسخ</h2>
              <form onSubmit={handleSubmitReply} className="space-y-4">
                <textarea
                  value={newReply.content}
                  onChange={(e) => setNewReply({ content: e.target.value, parentId: '' })}
                  placeholder="پاسخ خود را بنویسید..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={4}
                  required
                  disabled={isSubmitting}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>در حال ارسال...</span>
                      </>
                    ) : (
                      'ارسال پاسخ'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Replies */}
          <div className="space-y-6">
            {post.replies && post.replies.length > 0 ? (
              renderReplies(post.replies)
            ) : (
              <div className="text-center text-gray-500 py-12 bg-white rounded-2xl shadow-lg border border-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg">هنوز پاسخی ارسال نشده است</p>
                <p className="text-sm text-gray-400 mt-2">اولین نفری باشید که به این پست پاسخ می‌دهد</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-12 bg-white py-8 border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
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