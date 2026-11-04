import * as React from "react";
import { useSelector } from "react-redux";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminUserResponse } from "../../../dto/response/system/adminUserResponse";
import type { RootState } from "../../../redux/store/store";
import { tileColor } from "../../Content/Ads/column";

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const time = (d: Date) => d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });

/** "Today, 9:12", "Yesterday, 17:40", then "28 Oct" (with the year once it isn't this year). */
function lastSignIn(iso: string | null, now: number) {
    if (!iso) return "—";
    const d = new Date(iso);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const days = Math.round((today.getTime() - new Date(d).setHours(0, 0, 0, 0)) / 86_400_000);
    if (days === 0) return `Today, ${time(d)}`;
    if (days === 1) return `Yesterday, ${time(d)}`;
    return d.toLocaleDateString("en-GB", d.getFullYear() === today.getFullYear() ? { day: "numeric", month: "short" } : { day: "numeric", month: "short", year: "numeric" });
}

const longDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const TH = "whitespace-nowrap border-b px-3 py-2.5 text-left text-xs font-medium text-muted-foreground";
const TD = "border-b px-3 py-3 align-middle";

export function AdminComponent({ data }: { data: AdminUserResponse[] }) {
    const [now] = React.useState(() => Date.now());
    const me = useSelector((state: RootState) => state.auth.user?.id);

    // You first, then active admins by most recent sign-in, removed ones last.
    const rows = React.useMemo(() => [...data].sort((a, b) =>
        Number(b.id === me) - Number(a.id === me)
        || Number(b.isActive) - Number(a.isActive)
        || new Date(b.lastLogin ?? 0).getTime() - new Date(a.lastLogin ?? 0).getTime()
    ), [data, me]);

    return (
        <div className="mx-auto flex w-full min-w-0 flex-col gap-[18px] pb-12">
            <header className="flex flex-col gap-1">
                <h1 className="text-[26px] font-semibold tracking-tight">Admin users</h1>
                <p className="text-muted-foreground">People who can use this portal.</p>
            </header>

            <div className="flex items-start gap-3.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5 leading-normal text-info-soft-foreground">
                <Info className="mt-px size-5 flex-none" aria-hidden="true" />
                <span>Admins are added and removed in the AMUZE admin portal. They show up here after their first sign-in, so there is nothing to add on this page.</span>
            </div>

            <div className="overflow-x-auto rounded-[14px] border bg-card">
                <table className="w-full min-w-[760px] border-collapse text-sm">
                    <thead>
                        <tr>
                            <th className={TH}>Name</th>
                            <th className={TH}>Email</th>
                            <th className={TH}>Phone</th>
                            <th className={TH}>Last sign-in</th>
                            <th className={TH}>First sign-in</th>
                            <th className={TH}>Status</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child_td]:border-b-0">
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="h-32 text-center text-muted-foreground">No one has signed in yet.</td>
                            </tr>
                        ) : rows.map((admin) => {
                            const removed = !admin.isActive;
                            return (
                                <tr key={admin.id}>
                                    <td className={TD}>
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className={cn("inline-flex size-8 flex-none items-center justify-center rounded-full text-xs font-semibold", removed ? "bg-muted text-foreground/70" : "text-white")}
                                                style={removed ? undefined : { background: tileColor(admin.id) }}
                                                aria-hidden="true"
                                            >
                                                {initials(admin.name)}
                                            </span>
                                            <span className={cn("font-medium", removed && "text-foreground/70")}>{admin.name}</span>
                                            {admin.id === me && <span className="text-xs text-muted-foreground">· you</span>}
                                        </div>
                                    </td>
                                    <td className={cn(TD, removed && "text-foreground/70")}>{admin.email ?? "—"}</td>
                                    <td className={cn(TD, "font-mono tabular-nums")}>{admin.phone ?? "—"}</td>
                                    <td className={TD}>{lastSignIn(admin.lastLogin, now)}</td>
                                    <td className={TD}>{longDate(admin.createdAt)}</td>
                                    <td className={cn(TD, removed ? "text-foreground/70" : "font-medium text-success-soft-foreground")}>
                                        {removed ? "Removed in AMUZE" : "Active"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
