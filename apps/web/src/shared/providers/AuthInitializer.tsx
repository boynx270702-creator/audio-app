'use client';

import * as React from 'react';
import { useAuthStore } from '@/shared/stores/useAuthStore';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { fetchMe } = useAuthStore();
  
  React.useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
