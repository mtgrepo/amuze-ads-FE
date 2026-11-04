import { format } from "date-fns";
import type { AdvertisersResponse } from "../../dto/response/advertisers/advertisersResponse";
import type { AdResponse } from "../../dto/response/content/adResponse";

export type AdvertiserKind = "advertiser" | "agency" | "client";

/** Agency clients never sign in and have no wallet: their agency pays. */
export const kindOf = (a: Pick<AdvertisersResponse, "type" | "agencyId">): AdvertiserKind =>
    a.type === "agency" ? "agency" : a.agencyId ? "client" : "advertiser";

export const initials = (name: string) =>
    name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export const pts = (n: number) => `${n.toLocaleString("en-US")} pts`;

/** Balances under this are flagged red on active wallets. */
export const LOW_BALANCE = 5000;

export const isActive = (a: Pick<AdvertisersResponse, "status">) => a.status === "active";

/** "Agency · 4 clients", "Client of Orbit Media" or "Advertiser". */
export function typeLabel(a: AdvertisersResponse, all: AdvertisersResponse[], agencyName?: string): string {
    const kind = kindOf(a);
    if (kind === "agency") {
        const n = all.filter((c) => c.agencyId === a.id).length;
        return `Agency · ${n} ${n === 1 ? "client" : "clients"}`;
    }
    if (kind === "client") {
        const name = a.agency?.name ?? agencyName ?? all.find((x) => x.id === a.agencyId)?.name;
        return name ? `Client of ${name}` : "Agency client";
    }
    return "Advertiser";
}

export const since = (createdAt: string | undefined, pattern = "MMM yyyy") =>
    createdAt ? format(new Date(createdAt), pattern) : "—";

/** Live ads per account. An agency's count includes its clients' ads, since it pays for them. */
export function liveAdCounts(ads: AdResponse[], advertisers: AdvertisersResponse[]): Map<string, number> {
    const counts = new Map<string, number>();
    const agencyOf = new Map(advertisers.filter((a) => a.agencyId).map((a) => [a.id, a.agencyId as string]));
    for (const ad of ads) {
        if (ad.status !== "active") continue;
        const owner = ad.adSet?.campaign?.advertiser?.id;
        if (!owner) continue;
        counts.set(owner, (counts.get(owner) ?? 0) + 1);
        const agency = agencyOf.get(owner);
        if (agency) counts.set(agency, (counts.get(agency) ?? 0) + 1);
    }
    return counts;
}
