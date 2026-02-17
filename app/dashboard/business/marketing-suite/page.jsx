'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MarketingSuiteRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/business/marketing');
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
    </div>
  );
}
