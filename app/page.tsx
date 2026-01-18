'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TokenStorage, UserStorage } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const { token, isValid } = TokenStorage.get();
    const userId = UserStorage.getUserId();

    if (token && isValid && userId) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
