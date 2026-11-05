import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SIZES = [10, 20, 50];

type PageState = { pageIndex: number; pageSize: number };

/** The page buttons to show: first, last and the neighbours of the current page, with gaps marked by null. */
function pageList(page: number, count: number): (number | null)[] {
    const wanted = [...new Set([1, page - 1, page, page + 1, count])].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b);
    return wanted.flatMap((p, i) => (i && p - wanted[i - 1] > 1 ? [null, p] : [p]));
}

/** The footer inside a table's card: what's showing on the left, rows per page and page buttons on the right. Hidden only when the table is empty. */
export function TablePagination({ total, pageIndex, pageSize, onChange }: PageState & { total: number; onChange: (next: PageState) => void }) {
    if (total === 0) return null;

    const count = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(pageIndex + 1, count);
    const go = (p: number) => onChange({ pageIndex: p - 1, pageSize });
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);

    return (
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2.5 px-3.5 py-2.5 text-[13px] text-muted-foreground">
            <span>
                Showing <span className="font-mono tabular-nums">{from === to ? from : `${from}–${to}`}</span> of <span className="font-mono tabular-nums">{total.toLocaleString("en-US")}</span>
            </span>
            <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2">
                <div className="flex items-center gap-2">
                    <span id="rows-per-page">Rows per page</span>
                    <Select value={String(pageSize)} onValueChange={(v) => onChange({ pageIndex: 0, pageSize: Number(v) })}>
                        <SelectTrigger size="sm" aria-labelledby="rows-per-page" className="h-8 w-[68px] rounded-lg bg-card font-mono text-[13px] font-medium text-foreground">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SIZES.map((s) => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <nav aria-label="Pages" className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="size-8" aria-label="Previous page" disabled={page === 1} onClick={() => go(page - 1)}>
                        <ChevronLeft />
                    </Button>
                    {pageList(page, count).map((p, i) => p === null ? (
                        <span key={`gap-${i}`} className="inline-flex size-8 items-center justify-center font-mono" aria-hidden="true">…</span>
                    ) : (
                        <Button
                            key={p}
                            variant={p === page ? "default" : "ghost"}
                            size="icon"
                            className="size-8 font-mono text-[13px] font-medium"
                            aria-label={`Page ${p}`}
                            aria-current={p === page ? "page" : undefined}
                            onClick={() => go(p)}
                        >
                            {p}
                        </Button>
                    ))}
                    <Button variant="ghost" size="icon" className="size-8" aria-label="Next page" disabled={page === count} onClick={() => go(page + 1)}>
                        <ChevronRight />
                    </Button>
                </nav>
            </div>
        </div>
    );
}
