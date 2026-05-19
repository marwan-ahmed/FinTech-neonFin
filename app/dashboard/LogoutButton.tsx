'use client';

import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      // Force a full page reload to clear Next.js client-side router caches
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