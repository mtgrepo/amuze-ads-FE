import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotificationsResponse } from "../../dto/response/notifications/notificationsResponse";
import { fullDate, kindOf, KINDS, relativeTime, type Kind } from "./notification_utils";

type Filter = "all" | "unread" | "campaign" | "extension";

const FILTERS: { key: Filter; label: string; test: (n: NotificationsResponse) => boolean }[] = [
    { key: "all", label: "All", test: () => true },
    // `read` is the advertiser's flag, not the admin's.
    { key: "unread", label: "Not read yet", test: (n) => !n.read },
    { key: "campaign", label: "Campaigns", test: (n) => kindOf(n) === "campaign" },
    { key: "extension", label: "Extensions", test: (n) => kindOf(n) === "extension" },
];

const PAGE = 20;

function Tag({ kind }: { kind: Kind }) {
    return (
        <span className={cn("inline-flex h-[22px] items-center self-start rounded-[11px] px-2 text-[11px] font-medium", KINDS[kind].className)}>
            {KINDS[kind].label}
        </span>
    );
}

/** Where the reading pane's second button goes, by kind. */
const NEXT: Partial<Record<Kind, { label: string; to: string }>> = {
    campaign: { label: "Go to ads", to: "/ads" },
    extension: { label: "Go to ads", to: "/ads" },
    points: { label: "See transactions", to: "/transactions" },
};

export function NotiComponent({ data }: { data: NotificationsResponse[] }) {
    const [now] = React.useState(() => Date.now());
    const [filter, setFilter] = React.useState<Filter>("all");
    const [openId, setOpenId] = React.useState<string | null>(null);
    const [limit, setLimit] = React.useState(PAGE);

    const sorted = React.useMemo(
        () => [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        [data]
    );
    const test = FILTERS.find((f) => f.key === filter)!.test;
    const shown = sorted.filter(test);
    const left = shown.length - Math.min(limit, shown.length);
    const loadMore = () => setLimit(limit + PAGE);
    // The list scrolls on its own, so the open message stays put; more load as you reach the bottom.
    const onListScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        if (left > 0 && el.scrollTop + el.clientHeight >= el.scrollHeight - 80) loadMore();
    };
    const open = shown.find((n) => n.id === openId) ?? shown[0] ?? null;
    const openKind = open ? kindOf(open) : null;
    const next = openKind ? NEXT[openKind] : undefined;

    return (
        <div className="mx-auto flex w-full min-w-0 flex-col gap-[18px] pb-12">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-[26px] font-semibold tracking-tight">Notifications</h1>
                <div role="group" aria-label="Filter" className="flex gap-0.5 rounded-[9px] bg-muted p-[3px]">
                    {FILTERS.map((f) => {
                        const on = f.key === filter;
                        return (
                            <button
                                key={f.key}
                                type="button"
                                aria-pressed={on}
                                onClick={() => { setFilter(f.key); setLimit(PAGE); }}
                                className={cn(
                                    "h-[30px] rounded-[7px] px-3 text-[13px] font-medium text-foreground/70 hover:text-foreground",
                                    on && "bg-card text-foreground shadow-sm ring-1 ring-border"
                                )}
                            >
                                {f.label}
                            </button>
                        );
                    })}
                </div>
            </header>

            {shown.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-[14px] border bg-card px-5 py-16 text-center">
                    <span className="font-medium">{data.length === 0 ? "No notifications yet" : "Nothing in this view"}</span>
                    <span className="text-sm text-muted-foreground">
                        {data.length === 0 ? "Messages sent to advertisers show up here." : "Try another filter."}
                    </span>
                </div>
            ) : (
                <div className="flex flex-wrap items-start gap-4">
                    <section aria-label="Inbox" className="min-w-0 flex-[1_1_380px] overflow-hidden rounded-[14px] border bg-card">
                        <div key={filter} onScroll={onListScroll} className="max-h-[640px] overflow-y-auto">
                        {shown.slice(0, limit).map((n) => {
                            const current = n.id === open?.id;
                            return (
                                <button
                                    key={n.id}
                                    type="button"
                                    onClick={() => setOpenId(n.id)}
                                    aria-current={current ? "true" : undefined}
                                    className={cn(
                                        "flex w-full gap-3 border-b px-4 py-3.5 text-left last:border-b-0 hover:bg-muted/40",
                                        current && "bg-primary/5 hover:bg-primary/5"
                                    )}
                                >
                                    <span
                                        className={cn("mt-1.5 size-2 flex-none rounded-full", n.read ? "bg-transparent" : "bg-primary")}
                                        title={n.read ? undefined : "Not read by advertiser yet"}
                                        aria-hidden="true"
                                    />
                                    <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                                        <span className="flex justify-between gap-2.5">
                                            <span className="truncate font-medium">{n.title}</span>
                                            <span className="whitespace-nowrap text-xs text-muted-foreground">{relativeTime(n.createdAt, now)}</span>
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">{n.message}</span>
                                        <span className="flex min-w-0 items-center gap-2">
                                            <Tag kind={kindOf(n)} />
                                            <span className="truncate text-xs text-muted-foreground">To {n.advertiser?.name ?? "advertiser"}</span>
                                            {!n.read && <span className="sr-only">Not read by advertiser yet</span>}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                        </div>
                        {shown.length > PAGE && (
                            <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2.5 border-t px-3.5 py-2.5 text-[13px] text-muted-foreground">
                                <span>
                                    Showing <span className="font-mono tabular-nums">{Math.min(limit, shown.length)}</span> of <span className="font-mono tabular-nums">{shown.length}</span>
                                </span>
                                {left > 0 && (
                                    <Button variant="outline" size="sm" className="h-8 bg-card text-[13px]" onClick={loadMore}>Show {Math.min(PAGE, left)} more</Button>
                                )}
                            </div>
                        )}
                    </section>

                    {open && openKind && (
                        <section aria-label="Message" className="flex min-w-0 flex-[1.4_1_420px] flex-col gap-3.5 rounded-[14px] border bg-card p-[22px]">
                            <Tag kind={openKind} />
                            <h2 className="text-xl font-semibold">{open.title}</h2>
                            <span className="text-xs text-muted-foreground">
                                To {open.advertiser?.name ?? "advertiser"} · {fullDate(open.createdAt)}
                            </span>
                            <p className="whitespace-pre-line leading-relaxed text-foreground/80">{open.message}</p>
                            <span
                                className={cn(
                                    "inline-flex h-6 items-center self-start rounded-xl px-[9px] text-xs font-medium",
                                    open.read ? "bg-success-soft text-success-soft-foreground" : "bg-muted text-foreground/70"
                                )}
                            >
                                {open.read ? "Read by advertiser" : "Not read by advertiser yet"}
                            </span>
                            <div className="flex flex-wrap gap-2.5 border-t pt-3.5">
                                <Button asChild><Link to={`/advertisers/${open.advertiserId}`}>Open advertiser</Link></Button>
                                {next && <Button asChild variant="outline" className="bg-card"><Link to={next.to}>{next.label}</Link></Button>}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
