import { cn } from "@/lib/utils";
import type { AdvertisersResponse } from "../../dto/response/advertisers/advertisersResponse";
import { initials, isActive } from "./advertiser_utils";
import { tileColor } from "../Content/Ads/column";

/** Inactive, Verified or Not verified, as a pill. */
export function AdvertiserStatusPill({ advertiser, className }: { advertiser: Pick<AdvertisersResponse, "status" | "verified">; className?: string }) {
    const active = isActive(advertiser);
    const [label, tone] = !active
        ? ["Inactive", "bg-muted text-foreground/80"]
        : advertiser.verified
            ? ["Verified", "bg-success-soft text-success-soft-foreground"]
            : ["Not verified", "bg-warning-soft text-warning-soft-foreground"];
    return (
        <span className={cn("inline-flex h-6 items-center whitespace-nowrap rounded-full px-[9px] text-xs font-medium", tone, className)}>
            {label}
        </span>
    );
}

/** Round initials avatar; grey while the account is inactive. */
export function AdvertiserAvatar({ advertiser, size = 34, className }: { advertiser: Pick<AdvertisersResponse, "id" | "name" | "status">; size?: number; className?: string }) {
    const active = isActive(advertiser);
    return (
        <span
            aria-hidden="true"
            className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white", !active && "bg-muted-foreground", className)}
            style={{ width: size, height: size, fontSize: size >= 48 ? 18 : 12, background: active ? tileColor(advertiser.id) : undefined }}
        >
            {initials(advertiser.name)}
        </span>
    );
}
