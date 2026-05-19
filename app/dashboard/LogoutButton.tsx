'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      router.push('/');
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