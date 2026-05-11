import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  return (
    <button
      className={clsx(
        "focus-ring inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-ink text-paper shadow-sm shadow-ink/10 hover:bg-ink/90",
        variant === "secondary" && "border border-line bg-paper text-ink hover:border-muted/30 hover:bg-panel",
        variant === "danger" && "bg-danger text-paper shadow-sm shadow-danger/10 hover:bg-danger/90",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "focus-ring h-9 w-full rounded-md border border-line bg-paper px-3 text-sm text-ink shadow-sm shadow-ink/[0.02] transition-colors placeholder:text-muted hover:border-muted/30 disabled:cursor-not-allowed disabled:bg-panel disabled:text-muted",
        props.className
      )}
      {...props}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx("focus-ring h-9 w-full rounded-md border border-line bg-paper px-3 text-sm text-ink", props.className)}
      {...props}
    />
  );
}

export function Panel({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <section className={clsx("rounded-lg border border-line bg-paper shadow-sm shadow-ink/[0.04]", className)} {...props}>
      {children}
    </section>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium",
        tone === "neutral" && "border-line bg-panel text-muted",
        tone === "success" && "border-success/25 bg-success/10 text-success",
        tone === "warning" && "border-warning/30 bg-warning/10 text-warning",
        tone === "danger" && "border-danger/30 bg-danger/10 text-danger"
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-line bg-panel/60 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-md text-sm text-muted">{body}</p>
    </div>
  );
}

export function Field({
  label,
  hint,
  children
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-ink">
      <span>{label}</span>
      {hint ? <span className="ml-2 font-normal text-muted">{hint}</span> : null}
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
