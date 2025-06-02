export const isLoggedIn = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Auth event system
const AUTH_EVENT = 'authStateChanged';

export function emitAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
}

export function onAuthStateChange(callback: () => void) {
  if (typeof window !== 'undefined') {
    window.addEventListener(AUTH_EVENT, callback);
    return () => window.removeEventListener(AUTH_EVENT, callback);
  }
  return () => {};
} 