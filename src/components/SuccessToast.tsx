import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

export interface SuccessToastEventDetail {
  message: string;
  duration?: number;
}

export function triggerSuccessToast(message: string, duration = 3000) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<SuccessToastEventDetail>('app:success-toast', {
        detail: { message, duration },
      })
    );
  }
}

export const SuccessToast: React.FC = () => {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  useEffect(() => {
    const handleEvent = (e: Event) => {
      const customEvent = e as CustomEvent<SuccessToastEventDetail>;
      const { message, duration = 3000 } = customEvent.detail || {};
      if (!message) return;

      const id = Date.now();
      setToast({ id, message });

      const timeout = setTimeout(() => {
        setToast((curr) => (curr?.id === id ? null : curr));
      }, duration);

      return () => clearTimeout(timeout);
    };

    window.addEventListener('app:success-toast', handleEvent);
    return () => window.removeEventListener('app:success-toast', handleEvent);
  }, []);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="success-toast"
      data-testid="success-toast"
    >
      <CheckCircle2 size={20} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
      <span>{toast.message}</span>
    </div>
  );
};
