import { useContext } from 'react';

import { ToastContext } from '@/components/ToastProvider';

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast 는 ToastProvider 안에서만 쓸 수 있습니다');
  return ctx;
}
