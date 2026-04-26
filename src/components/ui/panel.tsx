import { cn } from "@/lib/utils";

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("bg-card border border-border rounded-[6px] overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function PanelHead({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-[14px] border-b border-border",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[12px] font-semibold tracking-[-0.005em] text-foreground">
      {children}
    </span>
  );
}

export function PanelBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}
