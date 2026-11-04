import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { AdPackageResponse } from "../../dto/response/adPackage/adPackageResponse";
import type { CampaignResponse } from "../../dto/response/content/campaignResponse";
import { useSetPackageActiveCommand } from "../../Composable/Command/adPackage/useSetPackageActiveCommand";
import PackageDrawer from "./package_form";
import { perDays, pts } from "./package_format";

type PackagesProps = {
  data: AdPackageResponse[];
  /** Used to count ads bought with each package; undefined while loading. */
  campaigns?: CampaignResponse[];
};

const SWITCH = "h-6 w-10 px-[2px] [&_[data-slot=switch-thumb]]:size-[18px] [&_[data-slot=switch-thumb]]:data-[state=checked]:translate-x-4";

// Packages are never deleted: campaigns keep a reference to the package they were bought with.
export function PackagesComponent({ data, campaigns }: PackagesProps) {
  // undefined = closed, null = adding a new package.
  const [drawer, setDrawer] = React.useState<AdPackageResponse | null | undefined>(undefined);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  const { setPackageActiveCommand, isPending } = useSetPackageActiveCommand();

  const packages = React.useMemo(() => [...data].sort((a, b) => a.sortOrder - b.sortOrder), [data]);
  // Drafts haven't been paid for, so they don't count as bought.
  const bought = React.useMemo(() => {
    const counts = new Map<string, number>();
    campaigns?.forEach((c) => {
      if (c.status !== "draft") counts.set(c.packageId, (counts.get(c.packageId) ?? 0) + 1);
    });
    return counts;
  }, [campaigns]);
  const boughtText = (id: string) => {
    const n = bought.get(id) ?? 0;
    return `${n.toLocaleString("en-US")} ${n === 1 ? "ad" : "ads"} bought`;
  };

  const confirmPkg = packages.find((p) => p.id === confirmId) ?? null;
  const nextOrder = packages.length ? Math.max(...packages.map((p) => p.sortOrder)) + 1 : 0;

  const setActive = async (id: string, isActive: boolean) => {
    try {
      await setPackageActiveCommand({ id, isActive });
      return true;
    } catch {
      // The command already shows why.
      return false;
    }
  };

  const turnOff = async () => {
    if (!confirmPkg) return;
    const { id, name } = confirmPkg;
    if (await setActive(id, false)) {
      setConfirmId(null);
      toast.success(`${name} is turned off`, {
        description: "Ads already bought with it keep running.",
        action: { label: "Undo", onClick: () => { void setActive(id, true); } },
      });
    }
  };

  return (
    <div className="mx-auto flex w-full min-w-0 flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] font-semibold tracking-tight">Packages</h1>
          <p className="max-w-[620px] leading-[1.45] text-muted-foreground">
            What advertisers buy when they create an ad. They pick a package and how many; objectives are added on top. Changing a package never changes ads already bought.
          </p>
        </div>
        <Button onClick={() => setDrawer(null)}><Plus /> Add package</Button>
      </header>

      {packages.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border bg-card px-5 py-12 text-center">
          <span className="font-medium">No packages yet</span>
          <span className="text-sm text-muted-foreground">Advertisers can't create ads until at least one package is on.</span>
          <Button className="mt-2" onClick={() => setDrawer(null)}><Plus /> Add package</Button>
        </div>
      ) : (
        <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
          {packages.map((p) => (
            <article key={p.id} className={cn("flex flex-col gap-2.5 rounded-2xl border bg-card p-[18px]", !p.isActive && "opacity-[0.72]")}>
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <h2 className="text-[17px] font-semibold">{p.name}</h2>
                  <span className="text-[13px] text-muted-foreground">{perDays(p.durationDays)}</span>
                </div>
                <Switch
                  checked={p.isActive}
                  disabled={isPending}
                  aria-label={`${p.isActive ? "Turn off" : "Turn on"} ${p.name}`}
                  onCheckedChange={(on) => { if (on) void setActive(p.id, true); else setConfirmId(p.id); }}
                  className={SWITCH}
                />
              </div>
              <span className="font-mono text-[26px] font-medium tracking-[-0.02em] tabular-nums">{pts(p.price)}</span>
              <p className="min-h-[38px] text-[13px] leading-[1.45] text-foreground/80">{p.description}</p>
              <div className="mt-auto flex items-center justify-between gap-2.5 border-t pt-3">
                <span className="text-xs text-muted-foreground">
                  {campaigns ? boughtText(p.id) : "…"}{p.isActive ? "" : " · off for new ads"}
                </span>
                <Button variant="outline" size="sm" className="h-8 bg-card text-[13px]" onClick={() => setDrawer(p)}>Edit</Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {drawer !== undefined && (
        <PackageDrawer key={drawer?.id ?? "new"} pkg={drawer} nextOrder={nextOrder} onClose={() => setDrawer(undefined)} />
      )}

      <Dialog open={!!confirmPkg} onOpenChange={(open) => !open && setConfirmId(null)}>
        <DialogContent role="alertdialog" showCloseButton={false} className="gap-3.5 rounded-2xl p-[22px] sm:max-w-[440px]">
          <DialogTitle className="text-lg font-semibold">Turn off {confirmPkg?.name}?</DialogTitle>
          <DialogDescription className="leading-normal text-foreground/80">
            Advertisers can no longer pick it for new ads. The <span className="font-mono tabular-nums">{confirmPkg ? (bought.get(confirmPkg.id) ?? 0).toLocaleString("en-US") : 0}</span> ads already bought with it keep running and can still be extended.
          </DialogDescription>
          <div className="mt-1.5 flex justify-end gap-2.5">
            <Button variant="outline" className="bg-card" onClick={() => setConfirmId(null)} disabled={isPending}>Keep it on</Button>
            <Button variant="destructive" onClick={turnOff} disabled={isPending}>Turn off</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
