"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  mode: "login" | "signup" | "confirm";
};

const illustrations = {
  login: {
    src: "/lottie/Tablet login-bro.svg",
    alt: "A person signing in securely on a tablet",
  },
  signup: {
    src: "/lottie/Sign up-amico.svg",
    alt: "A person creating a new account",
  },
  confirm: {
    src: "/lottie/Sign up-amico.svg",
    alt: "A person finishing their new account setup",
  },
} as const;

export function AuthShell({ children, mode }: AuthShellProps) {
  const shouldReduceMotion = useReducedMotion();
  const illustration = illustrations[mode];

  return (
    <main className="min-h-[100svh] bg-white lg:grid lg:grid-cols-[minmax(30rem,0.95fr)_minmax(34rem,1.05fr)]">
      <section className="relative hidden min-h-[100svh] overflow-hidden border-r border-arom-border bg-arom-wash px-10 py-9 text-arom lg:flex lg:flex-col xl:px-16 xl:py-12">
        <div
          aria-hidden="true"
          className="absolute -left-28 -top-24 size-80 rounded-full bg-white/72 blur-sm"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 -right-32 size-[30rem] rounded-full bg-arom-accent/10"
        />

        <Link
          href="/"
          aria-label="Go to AROM home"
          className="relative z-10 flex w-fit items-center gap-3 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-arom"
        >
          <span className="flex size-11 items-center justify-center rounded-[0.9rem] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <Image
              src="/brand/arom-mark.svg"
              alt=""
              width={38}
              height={30}
              className="h-7 w-9"
              unoptimized
            />
          </span>
          <span>
            <span className="block text-[1.45rem] font-bold leading-none tracking-[-0.04em]">
              AROM
            </span>
            <span className="mt-1.5 block text-[0.68rem] font-medium tracking-wide text-ink-muted">
              A calmer mind, a brighter you
            </span>
          </span>
        </Link>

        <div className="relative z-10 mx-auto flex w-full max-w-[38rem] flex-1 items-center justify-center py-8">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full px-2 xl:px-4"
          >
            <Image
              src={illustration.src}
              alt={illustration.alt}
              width={620}
              height={620}
              priority
              className="aspect-square h-auto w-full object-contain mix-blend-multiply drop-shadow-[0_18px_26px_rgba(31,111,91,0.1)]"
              unoptimized
            />
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center justify-between gap-5 text-xs font-medium text-arom/65">
          <span className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" size={16} /> Private by design
          </span>
          <span className="flex items-center gap-2">
            Made with care <Heart aria-hidden="true" size={15} />
          </span>
        </div>
      </section>

      <section className="relative flex min-h-[100svh] items-start justify-center px-5 py-6 sm:px-10 lg:items-center lg:px-14 lg:py-12 xl:px-20">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-arom via-arom-accent to-arom-soft lg:hidden" />

        <div className="w-full max-w-[29rem]">
          <div className="mb-9 flex items-center justify-between gap-4 lg:mb-7">
            <Link
              href="/"
              className="group inline-flex min-h-10 items-center gap-2 rounded-full pr-3 text-sm font-semibold text-arom transition-colors duration-150 hover:bg-arom-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-arom-wash transition-transform duration-150 group-hover:-translate-x-0.5">
                <ArrowLeft aria-hidden="true" size={18} />
              </span>
              <span className="hidden sm:inline">Back home</span>
            </Link>

            <Link
              href="/"
              aria-label="Go to AROM home"
              className="flex items-center gap-2 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arom lg:hidden"
            >
              <Image
                src="/brand/arom-mark.svg"
                alt=""
                width={34}
                height={27}
                className="h-7 w-9"
                unoptimized
              />
              <span className="text-xl font-bold tracking-[-0.04em] text-arom">AROM</span>
            </Link>
          </div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.23, 1, 0.32, 1] }}
          >
            {children}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
