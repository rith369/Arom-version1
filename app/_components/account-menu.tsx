'use client';

import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import type { UserRole } from '@/lib/auth';
import { useAuth } from './auth-provider';
import { useLanguage } from './language-provider';

const ROLE_LABELS: Record<UserRole, { en: string; km: string }> = {
  user: { en: 'Member', km: 'សមាជិក' },
  professional: { en: 'Professional', km: 'អ្នកជំនាញ' },
  admin: { en: 'Admin', km: 'អ្នកគ្រប់គ្រង' },
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** Open state that closes on an outside click or Escape. */
function useDismissableMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return { open, setOpen, rootRef };
}

/**
 * The dropdown itself: who is signed in, My profile and Log out. `placement`
 * "up" opens above the button, for buttons at the bottom of a sidebar.
 */
function AccountMenuPanel({
  id,
  open,
  km,
  placement,
  align,
  onNavigate,
}: {
  id: string;
  open: boolean;
  km: boolean;
  placement: 'down' | 'up';
  align: 'left' | 'right';
  onNavigate: () => void;
}) {
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const t = (kmText: string, enText: string) => (km ? kmText : enText);
  if (!user) return null;

  const name = user.fullName || user.email;
  const role = ROLE_LABELS[user.role];
  const offset = placement === 'up' ? 6 : -6;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id={id}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: offset, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: offset, scale: 0.97 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute z-50 overflow-hidden rounded-2xl border border-arom-border/70 bg-white shadow-lg ${
            placement === 'up'
              ? 'inset-x-0 bottom-full mb-2 origin-bottom'
              : `top-full mt-2 w-64 origin-top ${align === 'right' ? 'right-0' : 'left-0'}`
          }`}>
          <div className="border-b border-arom-border/60 px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            {user.email && <p className="truncate text-xs text-ink-muted">{user.email}</p>}
            <span className="mt-2 inline-block rounded-full bg-arom-soft px-2.5 py-0.5 text-xs font-semibold text-arom">
              {km ? role.km : role.en}
            </span>
          </div>
          <div className="p-1.5">
            <Link
              href="/profile"
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink transition-colors duration-150 hover:bg-arom-wash">
              <UserRound aria-hidden="true" size={18} className="text-arom" />
              {t('ប្រវត្តិរូបរបស់ខ្ញុំ', 'My profile')}
            </Link>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-arom-danger transition-colors duration-150 hover:bg-arom-danger-soft/60">
                <LogOut aria-hidden="true" size={18} />
                {t('ចាកចេញ', 'Log out')}
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Signed in account button for the top right of a page: shows who is signed
 * in, links to their profile and logs out. `englishOnly` is for the admin
 * area, which is English only.
 */
export function AccountMenu({
  englishOnly = false,
  compact = false,
}: {
  englishOnly?: boolean;
  compact?: boolean;
}) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const km = !englishOnly && language === 'km';
  const { open, setOpen, rootRef } = useDismissableMenu();
  const menuId = useId();

  if (!user) return null;

  const name = user.fullName || user.email;
  const role = ROLE_LABELS[user.role];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        className={`flex items-center rounded-full border border-arom-border/70 bg-white shadow-sm transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom ${
          compact ? 'h-9 gap-1 py-1 pl-1 pr-2' : 'h-[3.25rem] gap-2.5 py-1.5 pl-1.5 pr-3'
        }`}>
        <span
          aria-hidden="true"
          className={`flex items-center justify-center rounded-full bg-arom font-bold text-white ${
            compact ? 'size-7 text-xs' : 'size-10 text-sm'
          }`}>
          {initials(name)}
        </span>
        <span className={`hidden min-w-0 text-left ${compact ? '' : 'sm:block'}`}>
          <span className="block max-w-[10rem] truncate text-sm font-semibold text-ink">{name}</span>
          <span className="block text-xs text-ink-muted">{km ? role.km : role.en}</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          size={compact ? 14 : 16}
          className={`text-ink-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
        <span className="sr-only">{km ? 'ម៉ឺនុយគណនី' : 'Account menu'}</span>
      </button>

      <AccountMenuPanel
        id={menuId}
        open={open}
        km={km}
        placement="down"
        align="right"
        onNavigate={() => setOpen(false)}
      />
    </div>
  );
}

/**
 * Wraps a profile avatar (or the sidebar profile card) so a click opens the
 * account menu with My profile and Log out. Signed out visitors keep a plain
 * link to /profile, which shows them how to sign in.
 */
export function ProfileMenu({
  children,
  className,
  placement = 'down',
  align = 'right',
}: {
  children: ReactNode;
  className: string;
  placement?: 'down' | 'up';
  align?: 'left' | 'right';
}) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const km = language === 'km';
  const { open, setOpen, rootRef } = useDismissableMenu();
  const menuId = useId();
  const label = km ? 'ម៉ឺនុយគណនី (Account menu)' : 'Account menu';

  if (!user) {
    return (
      <Link href="/profile" aria-label={km ? 'ប្រវត្តិរូប និងការកំណត់' : 'Profile and settings'} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <div ref={rootRef} className={`relative ${placement === 'up' ? 'w-full' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={label}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        className={className}>
        {children}
      </button>
      <AccountMenuPanel
        id={menuId}
        open={open}
        km={km}
        placement={placement}
        align={align}
        onNavigate={() => setOpen(false)}
      />
    </div>
  );
}
