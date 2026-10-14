'use client';

import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
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

/**
 * Signed in account button for the top right of a page: shows who is signed
 * in, links to their profile and logs out. `englishOnly` is for the admin
 * area, which is English only.
 */
export function AccountMenu({ englishOnly = false }: { englishOnly?: boolean }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const km = !englishOnly && language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

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
        className="flex h-[3.25rem] items-center gap-2.5 rounded-full border border-arom-border/70 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom">
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-full bg-arom text-sm font-bold text-white">
          {initials(name)}
        </span>
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block max-w-[10rem] truncate text-sm font-semibold text-ink">{name}</span>
          <span className="block text-xs text-ink-muted">{km ? role.km : role.en}</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          size={16}
          className={`text-ink-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
        <span className="sr-only">{t('ម៉ឺនុយគណនី', 'Account menu')}</span>
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-arom-border/70 bg-white shadow-lg">
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
              onClick={() => setOpen(false)}
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
        </div>
      )}
    </div>
  );
}
