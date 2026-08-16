'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from '@/lib/auth';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#F3F4F1', fontFamily: "'Inter', sans-serif" }}
    >
      <p style={{ color: '#9CA3AF' }} className="text-sm">Loading…</p>
    </div>
  );
}