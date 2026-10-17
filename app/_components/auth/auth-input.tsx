"use client";

import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

type AuthInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  error?: string;
  /** Shown under the field, above any error, for example a password checklist. */
  hint?: ReactNode;
  icon: LucideIcon;
  /** Marks the field invalid without an error line, when the hint already explains it. */
  invalid?: boolean;
  label: string;
  revealable?: boolean;
};

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  function AuthInput(
    { error, hint, icon: Icon, id, invalid = false, label, revealable = false, type, ...inputProps },
    ref,
  ) {
    const [isVisible, setIsVisible] = useState(false);
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const inputType = revealable ? (isVisible ? "text" : "password") : type;
    const isInvalid = invalid || Boolean(error);
    const describedBy = [hint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined;

    return (
      <div>
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-ink">
          {label}
        </label>
        <div className="relative">
          <Icon
            aria-hidden="true"
            size={19}
            strokeWidth={1.9}
            className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
              isInvalid ? "text-arom-danger" : "text-arom"
            }`}
          />
          <input
            {...inputProps}
            ref={ref}
            id={id}
            type={inputType}
            aria-invalid={isInvalid}
            aria-describedby={describedBy}
            className={`h-[3.15rem] w-full rounded-xl border bg-arom-wash/75 pl-11 text-[0.94rem] text-ink outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-ink-muted/72 focus:bg-white focus:ring-4 ${
              revealable ? "pr-12" : "pr-4"
            } ${
              isInvalid
                ? "border-arom-danger/70 focus:border-arom-danger focus:ring-arom-danger/10"
                : "border-arom/35 hover:border-arom/60 focus:border-arom focus:ring-arom/10"
            }`}
          />
          {revealable && (
            <button
              type="button"
              onClick={() => setIsVisible((current) => !current)}
              aria-label={isVisible ? "Hide password" : "Show password"}
              aria-pressed={isVisible}
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted transition-colors duration-150 hover:bg-arom-soft hover:text-arom focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-arom"
            >
              {isVisible ? (
                <EyeOff aria-hidden="true" size={19} />
              ) : (
                <Eye aria-hidden="true" size={19} />
              )}
            </button>
          )}
        </div>
        <div className="min-h-5 pt-1">
          {hint && <div id={hintId}>{hint}</div>}
          {error && (
            <p id={errorId} role="alert" className="text-xs font-medium text-arom-danger">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  },
);

export function FormAlert({ children, tone }: { children: ReactNode; tone: "error" | "success" }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm font-medium leading-5 ${
        tone === "error"
          ? "border-arom-danger/20 bg-arom-danger-soft text-arom-danger"
          : "border-arom-accent/25 bg-arom-soft text-arom-deep"
      }`}
    >
      {children}
    </div>
  );
}
