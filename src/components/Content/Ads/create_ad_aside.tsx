import { useEffect, useMemo } from "react";
import { cn } from "../../../lib/utils";
import { AD_TYPE_OPTIONS } from "./ad_formats";
import { pts } from "./column";

/** Phone mock-up of where the ad sits in the app, using the uploaded creative when there is one. */
export function CreateAdPreview({ adType, placementLabel, title, link, asset }: {
  adType: string;
  placementLabel?: string;
  title: string;
  link: string;
  asset?: File;
}) {
  const url = useMemo(() => (asset ? URL.createObjectURL(asset) : null), [asset]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  const isVideo = asset?.type.startsWith("video/");
  const tall = adType === "interstitial" || adType === "reward_video";
  const typeLabel = AD_TYPE_OPTIONS.find((o) => o.value === adType)?.label;
  const host = link.replace(/^https?:\/\//i, "").split("/")[0];

  return (
    <section className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-[18px]">
      <span className="self-start text-[13px] font-semibold text-foreground/80">How it looks in the app</span>
      <div className="box-border flex h-[400px] w-[220px] flex-col gap-2.5 overflow-hidden rounded-[28px] border-8 border-zinc-900 bg-muted px-2.5 py-3.5 dark:border-zinc-700" aria-hidden="true">
        <div className="h-2.5 w-3/5 shrink-0 rounded-[5px] bg-foreground/10" />
        <div className="h-16 shrink-0 rounded-[10px] bg-foreground/5" />
        <div
          className={cn(
            "relative flex shrink-0 flex-col justify-end gap-1.5 overflow-hidden rounded-[10px] bg-primary p-3 text-white",
            tall ? "h-[220px]" : "h-[120px]",
          )}
        >
          {url && (isVideo
            ? <video src={url} muted autoPlay loop playsInline className="absolute inset-0 size-full object-cover" />
            : <img src={url} alt="" className="absolute inset-0 size-full object-cover" />)}
          {url && <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />}
          <span className="relative text-[10px] opacity-85">Sponsored</span>
          <span className="relative line-clamp-3 text-[15px] font-semibold leading-tight">{title || "Your campaign name"}</span>
          {host && (
            <span className="relative max-w-full self-start truncate rounded-md bg-white/90 px-[9px] py-1 text-[10px] font-medium text-zinc-900">{host}</span>
          )}
        </div>
        <div className="h-16 shrink-0 rounded-[10px] bg-foreground/5" />
        <div className="h-2.5 w-4/5 shrink-0 rounded-[5px] bg-foreground/10" />
      </div>
      <span className="text-xs text-muted-foreground">
        {typeLabel ? [typeLabel, placementLabel].filter(Boolean).join(" · ") : "Pick an ad type to preview it"}
      </span>
    </section>
  );
}

/** Package and objective costs, the total, and what it leaves on the payer's balance. */
export function CreateAdCost({ packageLine, planCost, objectiveLines, total, payerName, balance, balanceLoading }: {
  packageLine?: string;
  planCost: number;
  objectiveLines: { label: string; cost: number }[];
  total: number;
  payerName?: string;
  balance?: number;
  balanceLoading?: boolean;
}) {
  const short = balance !== undefined ? Math.max(0, total - balance) : 0;
  const fill = balance ? Math.min(100, (total / balance) * 100) : total > 0 ? 100 : 0;

  return (
    <section className="flex flex-col gap-2.5 rounded-2xl border bg-card p-[18px]">
      <span className="text-[13px] font-semibold text-foreground/80">Cost</span>
      <div className="flex justify-between gap-2.5">
        <span>{packageLine ?? "No package yet"}</span>
        <span className="font-mono tabular-nums">{pts(planCost)}</span>
      </div>
      {objectiveLines.map((l) => (
        <div key={l.label} className="flex justify-between gap-2.5 text-foreground/80">
          <span>{l.label}</span>
          <span className="font-mono tabular-nums">{pts(l.cost)}</span>
        </div>
      ))}
      <div className="my-1 h-px bg-muted" />
      <div className="flex items-baseline justify-between gap-2.5">
        <span className="font-semibold">Total</span>
        <span className="font-mono text-[22px] font-medium tabular-nums">{pts(total)}</span>
      </div>
      {payerName ? (
        <>
          <div className="flex justify-between gap-2.5 text-[13px] text-muted-foreground">
            <span>{payerName}'s balance</span>
            <span className="font-mono tabular-nums">{balanceLoading || balance === undefined ? "…" : pts(balance)}</span>
          </div>
          <div className="h-1.5 rounded-[3px] bg-muted">
            <div className={cn("h-1.5 rounded-[3px]", short > 0 ? "bg-destructive" : "bg-primary")} style={{ width: `${fill}%` }} />
          </div>
          {balance !== undefined && (
            <span className={cn("text-xs text-muted-foreground", short > 0 && "text-destructive")}>
              {short > 0 ? `${pts(short)} short. The ad can still be saved as a draft and paid later.` : `Leaves ${pts(balance - total)} after paying.`}
            </span>
          )}
        </>
      ) : (
        <span className="text-xs text-muted-foreground">Pick an advertiser to see their balance.</span>
      )}
    </section>
  );
}
