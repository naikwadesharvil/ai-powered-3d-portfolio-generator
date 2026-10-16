import { useEffect, useRef } from 'react';

export interface UseRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * useReveal - Reusable reveal system using IntersectionObserver.
 * Observes the element itself (if it has .reveal) and/or all child elements with .reveal.
 * Animates once per element (unobserves immediately upon intersection).
 * Respects prefers-reduced-motion: if enabled or IntersectionObserver is unsupported,
 * marks elements as revealed immediately with zero animation delay.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: UseRevealOptions
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Prefers-reduced-motion accessibility check
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fallback: If reduced-motion is requested or IntersectionObserver is missing
    if (
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      prefersReducedMotion
    ) {
      if (el.classList.contains('reveal')) {
        el.classList.add('is-revealed');
      }
      el.querySelectorAll('.reveal').forEach((child) => {
        child.classList.add('is-revealed');
      });
      return;
    }

    const elementsToObserve: Element[] = [];
    if (el.classList.contains('reveal')) {
      elementsToObserve.push(el);
    }
    el.querySelectorAll('.reveal').forEach((child) => {
      elementsToObserve.push(child);
    });

    if (elementsToObserve.length === 0) {
      return;
    }

    let observer: IntersectionObserver | null = null;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              // Animate once per element: unobserve after reveal
              observer?.unobserve(entry.target);
            }
          });
        },
        {
          threshold: options?.threshold ?? 0.1,
          rootMargin: options?.rootMargin ?? '0px 0px -40px 0px',
        }
      );

      elementsToObserve.forEach((target) => {
        if (target.classList.contains('is-revealed')) return;
        observer?.observe(target);
      });
    } catch {
      // Fallback on any observer creation or observation failure: show immediately
      elementsToObserve.forEach((target) => {
        target.classList.add('is-revealed');
      });
    }

    return () => {
      observer?.disconnect();
    };
  }, [options?.threshold, options?.rootMargin, options?.triggerOnce]);

  return ref;
}
