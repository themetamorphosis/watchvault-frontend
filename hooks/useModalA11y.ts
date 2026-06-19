import { useEffect, useRef, useCallback } from "react";

/**
 * Hook for modal accessibility: Escape to close, focus trap, scroll lock.
 * @param onClose - callback to close the modal
 * @param isOpen - whether the modal is currently visible (defaults to true for always-open modals)
 */
export function useModalA11y(onClose: () => void, isOpen: boolean = true) {
  const onCloseRef = useRef(onClose);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Escape key to close — only when open
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  // Lock body scroll — only when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Focus first focusable element on open
  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;
    // Small delay to let animations settle
    const id = requestAnimationFrame(() => {
      const focusable = container.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  // Focus trap — Tab cycles within modal
  const trapFocus = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const container = containerRef.current;
    if (!container) return;
    const focusables = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  return { containerRef, trapFocus };
}
