'use client';

import { CircleAlert } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { SheetDialog } from './sheet-dialog';

// AROM's own confirm window, used instead of the browser's window.confirm().
// A bottom sheet on phones and a small centered window on desktop. The safe
// choice (Cancel, Stay) has focus first, and Escape or a tap outside picks it.

export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  // danger: the action deletes or stops something.
  tone?: 'default' | 'danger';
};

type Request = { options: ConfirmOptions; resolve: (value: boolean) => void };

/**
 * `const { confirm, dialog } = useConfirm()`. Render `dialog` once in the
 * component, then `if (await confirm({...})) doIt()`.
 */
export function useConfirm() {
  const [request, setRequest] = useState<Request | null>(null);
  const [closing, setClosing] = useState(false);
  const current = useRef<Request | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    current.current?.resolve(false);
    return new Promise<boolean>((resolve) => {
      const next = { options, resolve };
      current.current = next;
      setClosing(false);
      setRequest(next);
    });
  }, []);

  const answer = useCallback((value: boolean) => {
    current.current?.resolve(value);
    current.current = null;
    setClosing(true);
  }, []);

  const dialog: ReactNode = request ? (
    <ConfirmDialog
      options={request.options}
      closing={closing}
      onAnswer={answer}
      onClosed={() => {
        setRequest(null);
        setClosing(false);
      }}
    />
  ) : null;

  return { confirm, dialog };
}

function ConfirmDialog({
  options,
  closing,
  onAnswer,
  onClosed,
}: {
  options: ConfirmOptions;
  closing: boolean;
  onAnswer: (value: boolean) => void;
  onClosed: () => void;
}) {
  const titleId = useId();
  const messageId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const danger = options.tone === 'danger';

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onAnswer(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus?.();
    };
  }, [onAnswer]);

  return (
    <SheetDialog
      closing={closing}
      onClosed={onClosed}
      labelledBy={titleId}
      panelClassName="w-full rounded-t-3xl bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-xl sm:max-w-sm sm:rounded-3xl"
      after={<button type="button" aria-hidden="true" tabIndex={-1} className="absolute inset-0 -z-10 cursor-default" onClick={() => onAnswer(false)} />}>
      <div aria-describedby={options.message ? messageId : undefined}>
        <span
          className={`flex size-11 items-center justify-center rounded-full ${
            danger ? 'bg-arom-danger-soft text-arom-danger' : 'bg-arom-soft text-arom'
          }`}>
          <CircleAlert size={22} aria-hidden="true" />
        </span>
        <h2 id={titleId} className="mt-4 text-lg font-bold text-ink">
          {options.title}
        </h2>
        {options.message && (
          <p id={messageId} className="mt-1.5 text-sm leading-6 text-ink-muted">
            {options.message}
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => onAnswer(false)}
            className="rounded-full border border-arom-border px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom">
            {options.cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onAnswer(true)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
              danger
                ? 'bg-arom-danger hover:bg-arom-danger/90 focus-visible:outline-arom-danger'
                : 'bg-arom hover:bg-arom-deep focus-visible:outline-arom'
            }`}>
            {options.confirmLabel}
          </button>
        </div>
      </div>
    </SheetDialog>
  );
}
