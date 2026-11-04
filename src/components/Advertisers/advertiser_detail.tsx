import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import type { AdvertisersResponse } from "../../dto/response/advertisers/advertisersResponse";
import type { AdResponse } from "../../dto/response/content/adResponse";
import { POINT_TYPE_LABELS, type PointLedgerEntry } from "../../dto/response/points/pointsResponse";
import { useAdvertisersQuery } from "../../Composable/Query/advertiser/useAdvertisersQuery";
import { useWalletQuery } from "../../Composable/Query/points/useWalletQuery";
import { useAdListQuery } from "../../Composable/Query/content/useAdListQuery";
import { statusLabel } from "../../lib/status";
import { runDates } from "../Content/Ads/column";
import { ProfileSheet } from "../AdvertiserProfiles/profile_sheet";
import { AdvertiserAvatar, AdvertiserStatusPill } from "./advertiser_status";
import { EditAdvertiserSheet } from "./edit_advertiser_sheet";
import { TopUpDialog } from "./top_up_dialog";
import { DeactivateDialog } from "./deactivate_dialog";
import { useAdvertiserActions } from "./use_advertiser_actions";
import { isActive, kindOf, pts, typeLabel } from "./advertiser_utils";

type Tab = "ads" | "tx" | "profile";
// The details endpoint sends lastLogin; the list type calls it last_login.
type Detail = AdvertisersResponse & { lastLogin?: string | null };

const STATUS_TONE: Record<string, string> = {
    active: "text-success-soft-foreground",
    pending: "text-warning-soft-foreground",
    paused: "text-warning-soft-foreground",
    rejected: "text-destructive",
};

const th = "border-b px-3 py-2.5 text-left text-xs font-medium whitespace-nowrap text-muted-foreground";
const td = "border-b border-border/60 p-3 align-middle";

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-[3px] font-medium break-words">{children}</dd>
        </div>
    );
}

function Empty({ title, note }: { title: string; note: string }) {
    return (
        <div className="flex flex-col items-center gap-2 rounded-[14px] border bg-card px-5 py-12 text-center">
            <span className="font-medium">{title}</span>
            <span className="text-sm text-muted-foreground">{note}</span>
        </div>
    );
}

function AdsTable({ ads }: { ads: AdResponse[] }) {
    if (!ads.length) return <Empty title="No ads yet" note="Ads they buy show up here." />;
    return (
        <div className="overflow-x-auto rounded-[14px] border bg-card">
            <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead><tr><th className={th}>Ad</th><th className={th}>Status</th><th className={th}>Package</th><th className={th}>Runs</th><th className={cn(th, "text-right")}>Clicks</th></tr></thead>
                <tbody>
                    {ads.map((ad) => {
                        const c = ad.adSet.campaign;
                        return (
                            <tr key={ad.id}>
                                <td className={td}><Link to={`/ads/${ad.id}`} className="font-medium text-primary hover:underline">{c.name}</Link></td>
                                <td className={cn(td, STATUS_TONE[ad.status] ?? "text-foreground/80")}>{ad.status === "active" ? "Live" : statusLabel(ad.status)}</td>
                                <td className={td}>{c.packageQuantity} × {c.packageName}</td>
                                <td className={cn(td, "whitespace-nowrap")}>{runDates(ad)}</td>
                                <td className={cn(td, "text-right font-mono tabular-nums")}>{(ad.totalClicks ?? 0).toLocaleString()}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function TransactionsTable({ entries, ads }: { entries: PointLedgerEntry[]; ads: AdResponse[] }) {
    if (!entries.length) return <Empty title="No transactions yet" note="Top-ups and ad payments show up here." />;
    const campaignName = new Map(ads.map((ad) => [ad.adSet.campaign.id, ad.adSet.campaign.name]));
    return (
        <div className="overflow-x-auto rounded-[14px] border bg-card">
            <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead><tr><th className={th}>Date</th><th className={th}>What</th><th className={cn(th, "text-right")}>Amount</th><th className={cn(th, "text-right")}>Balance</th></tr></thead>
                <tbody>
                    {entries.map((e) => {
                        const ref = (e.referenceId && campaignName.get(e.referenceId)) || e.note;
                        const amount = Number(e.amount);
                        return (
                            <tr key={e.id}>
                                <td className={cn(td, "whitespace-nowrap")}>{format(new Date(e.createdAt), "d MMM yyyy")}</td>
                                <td className={td}>{POINT_TYPE_LABELS[e.type] ?? e.type}{ref ? ` · ${ref}` : ""}</td>
                                <td className={cn(td, "text-right font-mono tabular-nums", amount >= 0 ? "text-success" : "text-destructive")}>
                                    {amount >= 0 ? "+" : "−"}{Math.abs(amount).toLocaleString("en-US")}
                                </td>
                                <td className={cn(td, "text-right font-mono tabular-nums")}>{Number(e.balanceAfter).toLocaleString("en-US")}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default function AdvertiserDetail({ data }: { data: Detail }) {
    const [now] = useState(() => new Date());
    const [tab, setTab] = useState<Tab>("ads");
    const [editOpen, setEditOpen] = useState(false);
    const [topUpOpen, setTopUpOpen] = useState(false);
    const [deactOpen, setDeactOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const { advertisersList } = useAdvertisersQuery();
    const all: AdvertisersResponse[] = advertisersList ?? [];
    const kind = kindOf(data);
    const agency = kind === "client" ? all.find((a) => a.id === data.agencyId) : undefined;
    // Agency clients spend their agency's points.
    const { wallet, isLoading: walletLoading } = useWalletQuery(kind === "client" ? data.agencyId ?? "" : data.id);
    const { adListData } = useAdListQuery(data.id);
    const ads: AdResponse[] = adListData ?? [];
    const liveAds = ads.filter((ad) => ad.status === "active").length;
    const { reactivate, deactivate, verify, isPending } = useAdvertiserActions();

    const active = isActive(data);
    const profile = data.profiles?.[0];
    const balance = wallet ? Number(wallet.balance) : undefined;
    const spentThisMonth = (wallet?.history ?? [])
        .filter((e) => e.type === "spend" && new Date(e.createdAt).getMonth() === now.getMonth() && new Date(e.createdAt).getFullYear() === now.getFullYear())
        .reduce((s, e) => s + Math.abs(Number(e.amount)), 0);
    const lastLogin = data.lastLogin ?? data.last_login;

    const tabs: [Tab, string][] = kind === "client"
        ? [["ads", "Ads"], ["profile", "Business profile"]]
        : [["ads", "Ads"], ["tx", "Transactions"], ["profile", "Business profile"]];

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-stretch gap-4">
                <section className="flex min-w-0 flex-[2_1_480px] flex-col gap-4 rounded-2xl border bg-card p-5">
                    <div className="flex flex-wrap items-center gap-4">
                        <AdvertiserAvatar advertiser={data} size={56} />
                        <div className="flex min-w-0 flex-col gap-1">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-2xl font-semibold">{data.name}</h1>
                                <AdvertiserStatusPill advertiser={data} />
                            </div>
                            <span className="text-[13px] text-muted-foreground">
                                {typeLabel(data, all)} · since {format(new Date(data.createdAt), "MMMM yyyy")}
                            </span>
                        </div>
                        <div className="ml-auto flex flex-wrap gap-2">
                            <Button variant="outline" className="bg-card" onClick={() => setEditOpen(true)}>Edit</Button>
                            {!data.verified && active && (
                                <Button variant="outline" className="bg-card" disabled={isPending} onClick={() => verify(data)}>Mark as verified</Button>
                            )}
                            {active ? (
                                <Button variant="outline" className="bg-card text-destructive hover:text-destructive" onClick={() => setDeactOpen(true)}>Deactivate</Button>
                            ) : (
                                <Button variant="outline" className="bg-card" disabled={isPending} onClick={() => reactivate(data)}>Reactivate</Button>
                            )}
                        </div>
                    </div>
                    <dl className="grid gap-x-5 gap-y-3 border-t pt-3.5 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
                        <Detail label="Email">{data.email || "—"}</Detail>
                        <Detail label="Phone">{data.phone || "—"}</Detail>
                        <Detail label="Business">{profile?.business_name || "—"}</Detail>
                        <Detail label="Last signed in">
                            {kind === "client" ? "Doesn't sign in" : lastLogin ? format(new Date(lastLogin), "d MMM yyyy, H:mm") : "Never"}
                        </Detail>
                    </dl>
                </section>

                <section className="flex min-w-0 flex-[1_1_300px] flex-col gap-2.5 rounded-2xl bg-zinc-900 p-5 text-white">
                    {kind === "client" ? (
                        <>
                            <span className="text-[13px] text-zinc-300">Paid by {agency?.name ?? "their agency"}</span>
                            <span className="font-mono text-[34px] font-medium tracking-tight tabular-nums">{walletLoading ? "…" : balance !== undefined ? pts(balance) : "—"}</span>
                            <span className="text-[13px] text-zinc-300">Agency balance · {liveAds} {liveAds === 1 ? "ad" : "ads"} live</span>
                            {agency && (
                                <Button asChild variant="outline" className="mt-auto self-start border-transparent bg-white text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 dark:border-transparent dark:bg-white dark:hover:bg-zinc-100">
                                    <Link to={`/advertisers/${agency.id}`}>Open agency</Link>
                                </Button>
                            )}
                        </>
                    ) : (
                        <>
                            <span className="text-[13px] text-zinc-300">Points balance</span>
                            <span className="font-mono text-[34px] font-medium tracking-tight tabular-nums">{walletLoading ? "…" : pts(balance ?? 0)}</span>
                            <span className="text-[13px] text-zinc-300">
                                Spent {pts(spentThisMonth)} in {format(now, "MMMM")} · {liveAds} {liveAds === 1 ? "ad" : "ads"} live
                            </span>
                            <Button variant="outline" className="mt-auto self-start border-transparent bg-white text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 dark:border-transparent dark:bg-white dark:hover:bg-zinc-100" onClick={() => setTopUpOpen(true)}>
                                Add points
                            </Button>
                        </>
                    )}
                </section>
            </div>

            <div role="tablist" aria-label="Sections" className="flex gap-[22px] overflow-x-auto overflow-y-hidden border-b">
                {tabs.map(([key, label]) => (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={tab === key}
                        onClick={() => setTab(key)}
                        className={cn(
                            "-mb-px inline-flex h-9 items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-1 text-sm font-medium text-foreground/70 hover:text-foreground",
                            tab === key && "border-primary text-foreground"
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === "ads" && <AdsTable ads={ads} />}
            {tab === "tx" && kind !== "client" && <TransactionsTable entries={wallet?.history ?? []} ads={ads} />}
            {tab === "profile" && (
                <section className="flex flex-col gap-4 rounded-[14px] border bg-card p-5">
                    {profile ? (
                        <>
                            <dl className="grid gap-x-6 gap-y-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
                                <Detail label="Business name">{profile.business_name || "—"}</Detail>
                                <Detail label="Business type">{profile.business_type || "—"}</Detail>
                                <Detail label="Website">
                                    {profile.website ? <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{profile.website.replace(/^https?:\/\//, "")}</a> : "—"}
                                </Detail>
                                <Detail label="Address">{profile.address || "—"}</Detail>
                                <Detail label="Business no.">{profile.business_no || "—"}</Detail>
                                <Detail label="DICA number">{profile.dica_number || "—"}</Detail>
                            </dl>
                            <Button variant="outline" className="self-start bg-card" onClick={() => setProfileOpen(true)}>Edit profile</Button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2 py-6 text-center">
                            <span className="font-medium">No business profile yet</span>
                            <span className="text-sm text-muted-foreground">Add their business details; complete profiles are quicker to verify.</span>
                            <Button className="mt-1" onClick={() => setProfileOpen(true)}>Add profile</Button>
                        </div>
                    )}
                </section>
            )}

            {editOpen && <EditAdvertiserSheet advertiser={data} onClose={() => setEditOpen(false)} />}
            {kind !== "client" && <TopUpDialog accountId={data.id} name={data.name} open={topUpOpen} onOpenChange={setTopUpOpen} />}
            <DeactivateDialog
                open={deactOpen}
                name={data.name}
                kind={kind}
                liveAds={liveAds}
                balance={kind === "client" ? undefined : balance}
                pending={isPending}
                onOpenChange={setDeactOpen}
                onConfirm={async () => { await deactivate(data, liveAds); setDeactOpen(false); }}
            />
            {profileOpen && (
                <ProfileSheet
                    advertiserId={data.id}
                    profile={profile ? { ...profile, advertiser_id: data.id, country: profile.country ?? "", timezone: profile.timezone ?? "" } : undefined}
                    onClose={() => setProfileOpen(false)}
                />
            )}
        </div>
    );
}
