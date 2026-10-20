"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PASSWORD_RULES } from "@/lib/auth";

// A five step strength bar under the sign up password, in place of the long
// checklist. It counts the same PASSWORD_RULES the form checks on submit, so
// "Strong" always means the password will be accepted.

export type StrengthLevel = "empty" | "weak" | "fair" | "good" | "strong";

const EASE = [0.23, 1, 0.32, 1] as const;

const COLORS: Record<Exclude<StrengthLevel, "empty">, string> = {
  weak: "bg-arom-danger",
  fair: "bg-arom-warning",
  good: "bg-arom-accent",
  strong: "bg-arom",
};

const LABELS: Record<StrengthLevel, string> = {
  empty: "",
  weak: "Weak",
  fair: "Fair",
  good: "Good",
  strong: "Strong",
};

export function getPasswordStrength(value: string): { level: StrengthLevel; passed: number } {
  if (!value) return { level: "empty", passed: 0 };
  const passed = PASSWORD_RULES.filter((rule) => rule.test(value)).length;
  const level: StrengthLevel = passed <= 1 ? "weak" : passed === 2 ? "fair" : passed <= 4 ? "good" : "strong";
  return { level, passed };
}

export function PasswordStrengthMeter({ value }: { value: string }) {
  const reduceMotion = useReducedMotion();
  const { level, passed } = getPasswordStrength(value);
  const activeColor = level === "empty" ? "" : COLORS[level];

  return (
    <AnimatePresence initial={false}>
      {value && (
        <motion.div
          key="password-strength"
          className="flex items-center gap-3 overflow-hidden pb-1"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: reduceMotion ? 0.1 : 0.18, ease: EASE }}
        >
          <span className="sr-only" aria-live="polite">
            {`Password strength: ${LABELS[level]}`}
          </span>
          <div className="grid flex-1 grid-cols-5 gap-1.5" aria-hidden="true">
            {PASSWORD_RULES.map((rule, index) => {
              const active = index < passed;
              return (
                <span key={rule.id} className="relative h-1.5 overflow-hidden rounded-full bg-arom-border/70">
                  <motion.span
                    className={`absolute inset-0 origin-left rounded-full transition-colors duration-200 ${activeColor}`}
                    initial={false}
                    animate={{
                      opacity: active ? 1 : 0,
                      transform: reduceMotion || active ? "scaleX(1)" : "scaleX(0)",
                    }}
                    transition={{ duration: reduceMotion ? 0.15 : 0.22, ease: EASE }}
                  />
                </span>
              );
            })}
          </div>
          <span aria-hidden="true" className="relative grid min-w-12 overflow-hidden text-right text-xs font-semibold text-ink-muted">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={level}
                className="col-start-1 row-start-1"
                initial={{ opacity: 0, transform: reduceMotion ? "none" : "translateY(25%)" }}
                animate={{ opacity: 1, transform: "none" }}
                exit={{ opacity: 0, transform: reduceMotion ? "none" : "translateY(-25%)" }}
                transition={{ duration: reduceMotion ? 0.15 : 0.18, ease: EASE }}
              >
                {LABELS[level]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
