'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useConfirm } from './confirm-dialog';

/**
 * Asks before leaving a page with unsaved changes. A link inside the app opens
 * AROM's own confirm window; Leave then follows the link. Closing the tab or
 * reloading still shows the browser's own warning, which pages cannot replace.
 * Render the returned element once in the page.
 */
export function useUnsavedChangesGuard(isDirty: boolean, km: boolean) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();

  useEffect(() => {
    if (!isDirty) return;

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest('a[href]');
      if (!link || link.getAttribute('target') === '_blank') return;
      const href = link.getAttribute('href') ?? '';
      if (href.startsWith('#')) return;

      event.preventDefault();
      event.stopPropagation();
      void confirm({
        title: km ? 'ចាកចេញដោយមិនរក្សាទុក?' : 'Leave without saving?',
        message: km
          ? 'អ្នកមានការផ្លាស់ប្តូរដែលមិនទាន់រក្សាទុក។ ប្រសិនបើអ្នកចាកចេញ ការផ្លាស់ប្តូរទាំងនោះនឹងបាត់។'
          : 'You have changes that are not saved. If you leave now, they will be lost.',
        confirmLabel: km ? 'ចាកចេញ' : 'Leave',
        cancelLabel: km ? 'នៅទីនេះ' : 'Stay',
        tone: 'danger',
      }).then((leave) => {
        if (!leave) return;
        const url = new URL(href, window.location.href);
        if (url.origin === window.location.origin) router.push(`${url.pathname}${url.search}${url.hash}`);
        else window.location.assign(url.href);
      });
    }

    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [isDirty, km, confirm, router]);

  return dialog;
}
