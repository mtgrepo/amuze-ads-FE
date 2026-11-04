import * as React from "react";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import type { ProfileResponse } from "../../dto/response/advertiserProfile/profileResponse";
import type { AdvertisersResponse } from "../../dto/response/advertisers/advertisersResponse";
import { useAdvertisersQuery } from "../../Composable/Query/advertiser/useAdvertisersQuery";
import { useProfileDeleteCommand } from "../../Composable/Command/advertiser-profile/useProfileDeleteCommand";
import { tileColor } from "../Content/Ads/column";
import { initials } from "../Advertisers/advertiser_utils";
import { useAdvertiserActions } from "../Advertisers/use_advertiser_actions";
import { ProfileSheet } from "./profile_sheet";

type Filter = "all" | "incomplete" | "unverified";
const FILTERS: [Filter, string][] = [["all", "All"], ["incomplete", "Incomplete"], ["unverified", "Not verified"]];

// What a complete profile has, besides the business name.
const CHECKS: [keyof ProfileResponse, string][] = [
    ["business_type", "business type"],
    ["business_no", "business no."],
    ["dica_number", "DICA number"],
    ["website", "website"],
    ["address", "address"],
    ["photo", "logo"],
];

function completeness(p: ProfileResponse) {
    const missing = CHECKS.filter(([key]) => !String(p[key] ?? "").trim()).map(([, label]) => label);
    return { pct: Math.round(((CHECKS.length - missing.length) / CHECKS.length) * 100), missing };
}

const siteLabel = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
const siteHref = (url: string) => (/^https?:\/\//.test(url) ? url : `https://${url}`);

export function ProfileComponent({ data }: { data: ProfileResponse[] }) {
    const [filter, setFilter] = React.useState<Filter>("all");
    const [editing, setEditing] = React.useState<ProfileResponse | null>(null);
    const [adding, setAdding] = React.useState(false);
    const [removing, setRemoving] = React.useState<ProfileResponse | null>(null);
    const { advertisersList } = useAdvertisersQuery();
    const owners = new Map(((advertisersList ?? []) as AdvertisersResponse[]).map((a) => [a.id, a]));
    const { verify, isPending } = useAdvertiserActions();
    const { deleteProfileCommand, isPending: deleting } = useProfileDeleteCommand();

    const cards = data
        .map((p) => ({ p, owner: owners.get(p.advertiser_id), ...completeness(p) }))
        .filter((c) => filter === "all" || (filter === "incomplete" ? c.pct < 100 : c.owner && !c.owner.verified));

    const confirmDelete = async () => {
        if (!removing) return;
        try {
            await deleteProfileCommand(removing.id);
            setRemoving(null);
        } catch {
            // The command already shows the reason.
        }
    };

    return (
        <div className="mx-auto flex w-full min-w-0 flex-col gap-[18px]">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-[26px] font-semibold tracking-tight">Advertiser profiles</h1>
                    <p className="text-muted-foreground">Business details advertisers give us. Complete profiles are quicker to verify.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    <div role="group" aria-label="Filter" className="flex gap-0.5 rounded-[9px] bg-muted p-[3px]">
                        {FILTERS.map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                aria-pressed={filter === key}
                                onClick={() => setFilter(key)}
                                className={cn(
                                    "h-[30px] rounded-[7px] px-3 text-[13px] font-medium text-foreground/80",
                                    filter === key && "bg-card text-foreground shadow-sm ring-1 ring-border"
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <Button onClick={() => setAdding(true)}>Add profile</Button>
                </div>
            </header>

            {cards.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl border bg-card px-5 py-12 text-center">
                    <span className="font-medium">{data.length === 0 ? "No profiles yet" : "Nothing here"}</span>
                    <span className="text-sm text-muted-foreground">
                        {data.length === 0 ? "Add an advertiser's business details to get started." : "Every profile is complete and verified in this view."}
                    </span>
                </div>
            ) : (
                <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
                    {cards.map(({ p, owner, pct, missing }) => (
                        <article key={p.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-[18px]">
                            <div className="flex items-center gap-3">
                                {p.photo ? (
                                    <img src={p.photo} alt="" className="size-11 shrink-0 rounded-[11px] object-cover" />
                                ) : (
                                    <span aria-hidden="true" className="inline-flex size-11 shrink-0 items-center justify-center rounded-[11px] font-semibold text-white" style={{ background: tileColor(p.id) }}>
                                        {initials(p.business_name)}
                                    </span>
                                )}
                                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <h2 className="truncate text-base font-semibold">{p.business_name}</h2>
                                    <span className="truncate text-xs text-muted-foreground">{p.business_type || "No type"} · owner {p.advertiser?.name ?? owner?.name ?? "—"}</span>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="size-8 shrink-0" aria-label={`Actions for ${p.business_name}`}>
                                            <MoreHorizontal />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40 rounded-xl p-1.5">
                                        <DropdownMenuItem className="cursor-pointer px-3 py-[9px]" onSelect={() => setEditing(p)}>Edit</DropdownMenuItem>
                                        <DropdownMenuItem variant="destructive" className="cursor-pointer px-3 py-[9px]" onSelect={() => setRemoving(p)}>Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between text-xs text-muted-foreground"><span>Profile complete</span><span className="font-mono tabular-nums">{pct}%</span></div>
                                <div className="h-1.5 rounded-[3px] bg-muted">
                                    <div className={cn("h-1.5 rounded-[3px]", pct === 100 ? "bg-success" : pct >= 60 ? "bg-primary" : "bg-warning")} style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground">{missing.length ? `Missing: ${missing.join(", ")}` : "Everything filled in"}</span>
                            </div>
                            <div className="mt-auto flex flex-wrap items-center gap-2 border-t pt-3">
                                {p.website
                                    ? <a href={siteHref(p.website)} target="_blank" rel="noopener noreferrer" className="min-w-0 truncate text-[13px] text-primary hover:underline">{siteLabel(p.website)}</a>
                                    : <span className="text-[13px] text-muted-foreground">No website</span>}
                                <span className="ml-auto" />
                                <Button asChild variant="outline" className="bg-card"><Link to={`/advertisers/${p.advertiser_id}`}>Open</Link></Button>
                                {owner && !owner.verified && (
                                    <Button variant="outline" className="border-primary bg-card text-primary hover:text-primary" disabled={isPending}
                                        onClick={() => verify(owner)}>
                                        Verify
                                    </Button>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {adding && <ProfileSheet onClose={() => setAdding(false)} />}
            {editing && (
                <ProfileSheet
                    key={editing.id}
                    profile={{
                        id: editing.id, advertiser_id: editing.advertiser_id, business_name: editing.business_name, business_no: editing.business_no,
                        business_type: editing.business_type, dica_number: editing.dica_number, website: editing.website, address: editing.address,
                        country: editing.country ?? "", timezone: editing.timezone ?? "", photo: editing.photo,
                    }}
                    onClose={() => setEditing(null)}
                />
            )}
            <Dialog open={!!removing} onOpenChange={(o) => { if (!o) setRemoving(null); }}>
                <DialogContent role="alertdialog" showCloseButton={false} className="flex w-[min(460px,100%)] flex-col gap-3.5 rounded-2xl bg-card p-[22px] sm:max-w-[460px]">
                    <DialogTitle className="text-lg font-semibold">Delete {removing?.business_name}?</DialogTitle>
                    <DialogDescription className="text-sm leading-normal text-foreground/80">
                        This removes the business profile for good. The advertiser account stays.
                    </DialogDescription>
                    <div className="mt-1.5 flex justify-end gap-2.5">
                        <Button variant="outline" className="bg-card" onClick={() => setRemoving(null)}>Cancel</Button>
                        <Button variant="destructive" disabled={deleting} onClick={confirmDelete}>Delete</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
