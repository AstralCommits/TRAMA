import { useEffect, useRef } from 'react';

type DialogAccessibilityOptions = {

  closeOnEscape?: boolean;
};

export function useDialogAccessibility<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
  options: DialogAccessibilityOptions = {},
) {
  const dialogRef = useRef<T>(null);
  const closeRef = useRef(onClose);
  const closeOnEscapeRef = useRef(options.closeOnEscape ?? true);
  closeRef.current = onClose;
  closeOnEscapeRef.current = options.closeOnEscape ?? true;

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const selector = [
      'a[href]',
      'area[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(',');

    const focusable = () => {
      if (!dialog) return [] as HTMLElement[];
      return Array.from(dialog.querySelectorAll<HTMLElement>(selector)).filter((element) => {
        if (element.hasAttribute('hidden') || element.getAttribute('aria-hidden') === 'true') return false;
        if (element.closest('[inert]')) return false;
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
    };

    const first = focusable()[0];
    if (first) first.focus();
    else dialog?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!closeOnEscapeRef.current) return;
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const elements = focusable();
      if (!elements.length) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      const focusOutsideDialog = !dialog?.contains(document.activeElement);

      if (event.shiftKey && (document.activeElement === firstElement || focusOutsideDialog)) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && (document.activeElement === lastElement || focusOutsideDialog)) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      if (previous?.isConnected && !previous.hasAttribute('disabled')) previous.focus();
    };
  }, [open]);

  return dialogRef;
}
