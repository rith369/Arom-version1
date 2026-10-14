'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useSyncExternalStore, type ReactNode, type Ref } from 'react';

// A window that is a bottom sheet on phones and a centered modal from the
// `sm` breakpoint. Phones: slides up from the bottom edge and leaves the same
// way. Desktop: fades in from a slightly smaller size. Reduced motion: fade only.
//
// The caller keeps `closing` state: set it to true to play the exit, and
// `onClosed` runs when the exit has finished (unmount the window there).

const DESKTOP = '(min-width: 640px)';
// --ease-out and the drawer curve from app/index.css.
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

function subscribe(onChange: () => void) {
  const query = window.matchMedia(DESKTOP);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function useDesktop() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => false);
}

export function SheetDialog({
  closing,
  onClosed,
  labelledBy,
  panelRef,
  panelClassName,
  children,
  after,
}: {
  closing: boolean;
  onClosed: () => void;
  labelledBy: string;
  panelRef?: Ref<HTMLDivElement>;
  panelClassName: string;
  children: ReactNode;
  // Full screen layers opened from the window (kept outside the moving panel).
  after?: ReactNode;
}) {
  const desktop = useDesktop();
  const reduce = useReducedMotion();

  const hidden = reduce ? { opacity: 0 } : desktop ? { opacity: 0, scale: 0.97 } : { y: '100%' };
  const shown = reduce ? { opacity: 1 } : desktop ? { opacity: 1, scale: 1 } : { y: 0 };
  const duration = closing ? 0.2 : desktop || reduce ? 0.2 : 0.3;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      initial={{ opacity: 0 }}
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}>
      <motion.div
        ref={panelRef}
        className={panelClassName}
        initial={hidden}
        animate={closing ? hidden : shown}
        transition={{ duration, ease: desktop ? EASE_OUT : EASE_DRAWER }}
        onAnimationComplete={() => {
          if (closing) onClosed();
        }}>
        {children}
      </motion.div>
      {after}
    </motion.div>
  );
}
