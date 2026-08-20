import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { TOAST_MS } from '@/lib/constants';

import styles from './Toast.module.css';

type ToastApi = { show: (message: string) => void };

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext<ToastApi | null>(null);

/**
 * 토스트 — 화면당 하나만 뜬다.
 * 새 토스트가 오면 문구를 갈아끼우고 타이머를 리셋한다 (프로토타입 flash() 동일).
 */
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback((text: string) => {
    setMessage(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(''), TOAST_MS);
  }, []);

  // 언마운트 시 타이머 정리
  useEffect(() => () => clearTimeout(timer.current), []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {message && (
        <div className={styles.toast} role="status" aria-live="polite">
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}
