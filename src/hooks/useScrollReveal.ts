import { useEffect, useState, useCallback } from "react";

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook for scroll-triggered reveal animations
 *
 * Uses a callback ref pattern to properly handle async-loaded content.
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { ref, isVisible } = useScrollReveal();
 *   return (
 *     <div ref={ref} className={`reveal ${isVisible ? 'visible' : ''}`}>
 *       Content
 *     </div>
 *   );
 * }
 * ```
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const { threshold = 0.1, rootMargin = "0px 0px -50px 0px", triggerOnce = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [element, setElement] = useState<T | null>(null);

  // Callback ref that updates state when element mounts/unmounts
  const ref = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [element, threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

/**
 * Hook for staggered children animations
 *
 * Uses a callback ref pattern to properly handle async-loaded content.
 *
 * Usage:
 * ```tsx
 * function MyGrid() {
 *   const { containerRef, isVisible } = useStaggerReveal();
 *   return (
 *     <div ref={containerRef} className="grid">
 *       {items.map((item, i) => (
 *         <div
 *           key={item.id}
 *           className={`reveal ${isVisible ? 'visible' : ''}`}
 *           style={{ animationDelay: `${i * 75}ms` }}
 *         >
 *           {item.content}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const { threshold = 0.1, rootMargin = "0px 0px -50px 0px", triggerOnce = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [element, setElement] = useState<T | null>(null);

  // Callback ref that updates state when element mounts/unmounts
  const containerRef = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [element, threshold, rootMargin, triggerOnce]);

  // Helper to get stagger delay style
  const getStaggerStyle = useCallback((index: number, baseDelay = 75) => {
    return { animationDelay: `${index * baseDelay}ms` };
  }, []);

  return { containerRef, isVisible, getStaggerStyle };
}
