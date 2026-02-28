import { useEffect, useRef } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  enabled?: boolean;
}

export const useScrollAnimation = (
  options: UseScrollAnimationOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    enabled = true,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    
    // Reset initialized flag when enabled changes
    initializedRef.current = false;
    
    // Wait for element to be available
    const checkElement = () => {
      const element = ref.current;
      if (!element || initializedRef.current) return;

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            element.classList.add('animate-spawn-visible');
            if (triggerOnce) {
              observerRef.current?.unobserve(element);
            }
          } else if (!triggerOnce) {
            element.classList.remove('animate-spawn-visible');
          }
        },
        {
          threshold,
          rootMargin,
        }
      );

      observerRef.current.observe(element);
      initializedRef.current = true;
    };

    // Check immediately and retry a few times
    const timeout = setTimeout(checkElement, 100);
    const timeout2 = setTimeout(checkElement, 300);
    const timeout3 = setTimeout(checkElement, 500);
    
    return () => {
      clearTimeout(timeout);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      observerRef.current?.disconnect();
      initializedRef.current = false;
    };
  }, [threshold, rootMargin, triggerOnce, enabled]);

  return ref;
};
