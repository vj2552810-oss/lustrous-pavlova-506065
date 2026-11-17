import type { ReactNode } from "react";

export const inputCls = (hasError?: boolean) =>
  `w-full rounded-2xl border bg-white px-4 py-3.5 text-sm text-ink placeholder:text-neutral-500 transition focus:outline-none focus:ring-4 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-neutral-200 focus:border-gold focus:ring-gold/15"
  }`;

export function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
  className = "",
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-neutral-600">
        {label}
        {required && (
          <span className="ml-0.5 text-gold-dark" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {/* Always reserve one line so fields with and without helper text keep the
          same vertical footprint and the grid rows stay aligned (issue 13). */}
      <div className="mt-1.5 min-h-[1.125rem]">
        {error ? (
          <p id={`${id}-error`} role="alert" className="text-xs font-medium text-red-600">
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-xs text-neutral-500">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
