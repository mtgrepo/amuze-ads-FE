import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
    return <section className={cn("rounded-xl border bg-card p-5", className)}>{children}</section>;
}

export function PanelHeader({ title, meta }: { title: string; meta?: ReactNode }) {
    return (
        <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-sm font-medium">{title}</h2>
            {meta && <div className="text-xs text-muted-foreground">{meta}</div>}
        </div>
    );
}

/** Quiet placeholder rows while a panel loads. */
export function PanelLoading({ rows = 3 }: { rows?: number }) {
    return (
        <div className="mt-4 space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-muted" style={{ width: `${85 - i * 15}%` }} />
            ))}
        </div>
    );
}
