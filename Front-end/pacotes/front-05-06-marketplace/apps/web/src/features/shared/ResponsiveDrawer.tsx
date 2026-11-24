import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router';

type NavigationItem = {
  id: string;
  label: string;
  to: string;
};

type ResponsiveDrawerProps = {
  items: NavigationItem[];
  activeItem: string;
  brand?: string;
};

export function ResponsiveDrawer({
  items,
  activeItem,
  brand = 'TRAMA',
}: ResponsiveDrawerProps) {
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const titleId = useId();
  const drawerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    document.body.style.overflow = 'hidden';

    const getFocusableElements = () => Array.from(
      drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => element.getAttribute('aria-hidden') !== 'true');

    const firstFocusable = getFocusableElements()[0];
    (firstFocusable ?? drawerRef.current)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        drawerRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const focusIsInside = drawerRef.current?.contains(document.activeElement);

      if (event.shiftKey && (!focusIsInside || document.activeElement === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (!focusIsInside || document.activeElement === last)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);

      if (triggerRef.current?.isConnected) {
        triggerRef.current.focus();
      } else if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [open]);

  const closeDrawer = () => setOpen(false);

  const renderItem = (item: NavigationItem, mobile = false) => {
    const isActive = activeItem === item.id;
    const className = [
      'flex min-h-[44px] items-center rounded-lg px-4 py-2 text-sm font-semibold',
      'transition-colors focus-visible:outline focus-visible:outline-2',
      'focus-visible:outline-offset-2 focus-visible:outline-[#B84E2C]',
      isActive
        ? 'bg-[#E3CEAD] text-[#7A321F]'
        : 'text-[#352219] hover:bg-[#E3CEAD]',
      mobile ? 'w-full' : 'whitespace-nowrap',
    ].join(' ');

    return (
      <Link
        key={item.id}
        to={item.to}
        onClick={closeDrawer}
        aria-current={isActive ? 'page' : undefined}
        className={className}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E3CEAD] bg-[#F2E5D0]">
      <div className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between gap-3 px-4 xs:px-5 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="shrink-0 rounded-sm text-lg font-bold tracking-[0.16em] text-[#352219] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B84E2C] sm:text-xl"
          aria-label={`${brand} — página inicial`}
        >
          {brand}
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden min-w-0 flex-1 justify-end gap-2 md:flex"
        >
          {items.map((item) => renderItem(item))}
        </nav>

        <button
          ref={triggerRef}
          type="button"
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-[#352219] hover:bg-[#E3CEAD] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B84E2C] md:hidden"
          aria-label={open ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
          aria-expanded={open}
          aria-controls={drawerId}
          onClick={() => setOpen((current) => !current)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open
              ? <path d="M18 6 6 18M6 6l12 12" />
              : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      <div className={open ? 'fixed inset-0 z-[100] md:hidden' : 'hidden'}>
          <button
            type="button"
            aria-label="Fechar menu de navegação"
            tabIndex={-1}
            onClick={closeDrawer}
            className="absolute inset-0 h-full w-full cursor-default bg-black/50"
          />

          <aside
            ref={drawerRef}
            id={drawerId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="absolute right-0 top-0 flex h-[100dvh] w-[min(86vw,340px)] flex-col overflow-y-auto bg-[#F2E5D0] p-5 shadow-2xl"
          >
            <div className="mb-8 flex items-center justify-between gap-3">
              <h2 id={titleId} className="text-xl font-bold tracking-[0.16em] text-[#352219]">
                {brand}
              </h2>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Fechar menu"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-2xl text-[#352219] hover:bg-[#E3CEAD] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B84E2C]"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <nav aria-label="Menu mobile" className="flex flex-col gap-2">
              {items.map((item) => renderItem(item, true))}
            </nav>
          </aside>
      </div>
    </header>
  );
}

export const marketplaceNavigation: NavigationItem[] = [
  { id: 'inicio', label: 'Página inicial', to: '/' },
  { id: 'catalogo', label: 'Catálogo', to: '/catalogo' },
  { id: 'painel-artesao', label: 'Painel do artesão', to: '/painel-artesao' },
];
