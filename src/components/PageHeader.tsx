import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">
            {eyebrow}
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-[28px]">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  variant = "navy",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "navy" | "blue";
}) {
  const cls =
    variant === "navy"
      ? "bg-navy text-white hover:bg-navy-hover"
      : "bg-brand-blue text-white hover:brightness-110";
  return (
    <button
      onClick={onClick}
      className={
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors " +
        cls
      }
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
    >
      {children}
    </button>
  );
}

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-8">{children}</div>;
}
