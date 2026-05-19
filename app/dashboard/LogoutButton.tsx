'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      // 1. Sign out from Firebase Client Auth to clear tokens in browser memory
      const auth = getFirebaseAuth();
      await signOut(auth);

      // 2. Clear server-side session cookie by hitting our API endpoint
      await fetch('/api/auth', { method: 'DELETE' });

      // 3. Force a full page reload to clear client-side caches and redirect to landing
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center justify-center p-2 rounded-full border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
      title="تسجيل الخروج"
    >
      <LogOut size={16} />
    </button>
  );
}