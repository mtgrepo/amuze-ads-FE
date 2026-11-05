import * as React from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import type { AdvertisersResponse } from "../../dto/response/advertisers/advertisersResponse";
import { useBalancesQuery } from "../../Composable/Query/points/useBalancesQuery";
import { useAdListQuery } from "../../Composable/Query/content/useAdListQuery";
import { useAdvertiserDeleteCommand } from "../../Composable/Command/advertiser/useAdvertiserDeleteCommand";
import { TablePagination } from "../Common/Pagination/table_pagination";
import { AdvertiserAvatar, AdvertiserStatusPill } from "./advertiser_status";
import { AddAdvertiserSheet } from "./add_advertiser_sheet";
import { EditAdvertiserSheet } from "./edit_advertiser_sheet";
import { TopUpDialog } from "./top_up_dialog";
import { DeactivateDialog } from "./deactivate_dialog";
import { useAdvertiserActions } from "./use_advertiser_actions";
import { isActive, kindOf, liveAdCounts, LOW_BALANCE, pts, since, typeLabel } from "./advertiser_utils";

type Tab = "all" | "advertiser" | "agency" | "client" | "unverified";
const TABS: { key: Tab; label: string; test: (a: AdvertisersResponse) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "advertiser", label: "Advertisers", test: (a) => kindOf(a) === "advertiser" },
  { key: "agency", label: "Agencies", test: (a) => kindOf(a) === "agency" },
  { key: "client", label: "Agency clients", test: (a) => kindOf(a) === "client" },
  { key: "unverified", label: "Not verified", test: (a) => !a.verified },
];

type Dialogs = { edit?: string; topUp?: string; deactivate?: string; remove?: string };

export function AdvertisersComponent({ data }: { data: AdvertisersResponse[] }) {
  const [tab, setTab] = React.useState<Tab>("all");
  const [addOpen, setAddOpen] = React.useState(false);
  const [dialogs, setDialogs] = React.useState<Dialogs>({});
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const qc = useQueryClient();

  const walletIds = React.useMemo(() => data.filter((a) => kindOf(a) !== "client").map((a) => a.id), [data]);
  const { balances, isLoading: balancesLoading } = useBalancesQuery(walletIds);
  const { adListData } = useAdListQuery();
  const live = React.useMemo(() => liveAdCounts(adListData ?? [], data), [adListData, data]);
  const { reactivate, deactivate, verify, isPending } = useAdvertiserActions();
  const { deleteAdvertiserCommand, isPending: deleting } = useAdvertiserDeleteCommand();

  const rows = data.filter(TABS.find((t) => t.key === tab)!.test);
  // Step back if the rows on this page are gone, e.g. after deleting the last one.
  const pageIndex = Math.min(pagination.pageIndex, Math.max(0, Math.ceil(rows.length / pagination.pageSize) - 1));
  const pageRows = rows.slice(pageIndex * pagination.pageSize, (pageIndex + 1) * pagination.pageSize);

  const byId = (id?: string) => (id ? data.find((a) => a.id === id) : undefined);
  const editing = byId(dialogs.edit);
  const toppingUp = byId(dialogs.topUp);
  const deactivating = byId(dialogs.deactivate);
  const removing = byId(dialogs.remove);

  const pickTab = (key: Tab) => {
    setTab(key);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const confirmDeactivate = async () => {
    if (!deactivating) return;
    await deactivate(deactivating, live.get(deactivating.id) ?? 0);
    setDialogs({});
  };

  const confirmDelete = async () => {
    if (!removing) return;
    try {
      await deleteAdvertiserCommand(removing.id);
      qc.invalidateQueries({ queryKey: ["advertisers"] });
      setDialogs({});
    } catch (err) {
      toast.error("Couldn't delete", { description: err instanceof Error ? err.message : undefined });
    }
  };

  return (
    <div className="mx-auto flex w-full min-w-0 flex-col gap-[18px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] font-semibold tracking-tight">Advertisers</h1>
          <p className="text-muted-foreground">Businesses that buy ads, and the agencies that buy for their clients. Use ⋯ on a row to edit, verify or deactivate.</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>Add advertiser</Button>
      </header>

      <div role="tablist" aria-label="Type" className="flex gap-[22px] overflow-x-auto overflow-y-hidden border-b">
        {TABS.map((t) => {
          const on = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => pickTab(t.key)}
              className={cn(
                "-mb-px inline-flex h-9 items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-1 text-sm font-medium text-foreground/70 hover:text-foreground",
                on && "border-primary text-foreground"
              )}
            >
              {t.label}
              <span className={cn("rounded-[10px] px-[7px] py-px font-mono text-xs", on ? "bg-primary/10 text-primary" : "bg-muted text-foreground/70")}>
                {data.filter(t.test).length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-[14px] border bg-card">
        <div className="overflow-x-auto rounded-t-[14px]">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {["Name", "Type", "Contact", "Balance", "Live ads", "Status"].map((h) => (
                <TableHead key={h} className={cn("h-auto px-3 py-2.5 text-xs font-medium text-muted-foreground", (h === "Balance" || h === "Live ads") && "text-right")}>{h}</TableHead>
              ))}
              <TableHead className="h-auto w-[50px] px-3 py-2.5"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length ? pageRows.map((a) => {
              const kind = kindOf(a);
              const active = isActive(a);
              const balance = balances.get(a.id);
              const low = balance !== undefined && balance < LOW_BALANCE && active;
              return (
                <TableRow key={a.id} className={cn("hover:bg-transparent", !active && "text-muted-foreground")}>
                  <TableCell className="p-3">
                    <div className="flex items-center gap-3">
                      <AdvertiserAvatar advertiser={a} />
                      <div className="flex flex-col gap-0.5">
                        <Link to={`/advertisers/${a.id}`} className="font-medium hover:text-primary hover:underline">{a.name}</Link>
                        <span className="text-xs text-muted-foreground">Since {since(a.createdAt)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-3">{typeLabel(a, data)}</TableCell>
                  <TableCell className="p-3">
                    <div className="flex flex-col gap-0.5">
                      <span>{a.email || "—"}</span>
                      <span className="text-xs text-muted-foreground">{kind === "client" ? "Paid by agency" : a.phone || "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className={cn("p-3 text-right font-mono tabular-nums", low && "font-medium text-destructive")}>
                    {kind === "client" ? "—" : balance !== undefined ? pts(balance) : balancesLoading ? "…" : "—"}
                  </TableCell>
                  <TableCell className="p-3 text-right font-mono tabular-nums">{live.get(a.id) ?? 0}</TableCell>
                  <TableCell className="p-3"><AdvertiserStatusPill advertiser={a} /></TableCell>
                  <TableCell className="p-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-[34px]" aria-label={`Actions for ${a.name}`}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" aria-label="Advertiser actions" className="w-[200px] rounded-xl p-1.5">
                        <DropdownMenuItem asChild className="cursor-pointer px-3 py-[9px]"><Link to={`/advertisers/${a.id}`}>View details</Link></DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer px-3 py-[9px]" onSelect={() => setDialogs({ edit: a.id })}>Edit</DropdownMenuItem>
                        {kind !== "client" && (
                          <DropdownMenuItem className="cursor-pointer px-3 py-[9px]" onSelect={() => setDialogs({ topUp: a.id })}>Add points</DropdownMenuItem>
                        )}
                        {!a.verified && active && (
                          <DropdownMenuItem className="cursor-pointer px-3 py-[9px]" disabled={isPending} onSelect={() => verify(a)}>Mark as verified</DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="mx-1 my-1.5" />
                        {active ? (
                          <DropdownMenuItem variant="destructive" className="cursor-pointer px-3 py-[9px]" onSelect={() => setDialogs({ deactivate: a.id })}>Deactivate</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="cursor-pointer px-3 py-[9px]" disabled={isPending} onSelect={() => reactivate(a)}>Reactivate</DropdownMenuItem>
                        )}
                        <DropdownMenuItem variant="destructive" className="cursor-pointer px-3 py-[9px]" onSelect={() => setDialogs({ remove: a.id })}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-medium">{data.length === 0 ? "No advertisers yet" : "No advertisers here"}</span>
                    <span className="text-sm text-muted-foreground">{data.length === 0 ? "Add the first one to start selling ads." : "Try another tab."}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
        <TablePagination total={rows.length} pageIndex={pageIndex} pageSize={pagination.pageSize} onChange={setPagination} />
      </div>

      <AddAdvertiserSheet open={addOpen} onOpenChange={setAddOpen} advertisers={data} />
      {editing && <EditAdvertiserSheet key={editing.id} advertiser={editing} onClose={() => setDialogs({})} />}
      {toppingUp && (
        <TopUpDialog accountId={toppingUp.id} name={toppingUp.name} open onOpenChange={(o) => { if (!o) setDialogs({}); }} />
      )}
      {deactivating && (
        <DeactivateDialog
          open
          name={deactivating.name}
          kind={kindOf(deactivating)}
          liveAds={live.get(deactivating.id) ?? 0}
          balance={balances.get(deactivating.id)}
          pending={isPending}
          onOpenChange={(o) => { if (!o) setDialogs({}); }}
          onConfirm={confirmDeactivate}
        />
      )}
      <Dialog open={!!removing} onOpenChange={(o) => { if (!o) setDialogs({}); }}>
        <DialogContent role="alertdialog" showCloseButton={false} className="flex w-[min(460px,100%)] flex-col gap-3.5 rounded-2xl bg-card p-[22px] sm:max-w-[460px]">
          <DialogTitle className="text-lg font-semibold">Delete {removing?.name}?</DialogTitle>
          <DialogDescription className="text-sm leading-normal text-foreground/80">
            This removes the account for good and can't be undone. To stop them for now, deactivate instead.
          </DialogDescription>
          <div className="mt-1.5 flex justify-end gap-2.5">
            <Button variant="outline" className="bg-card" onClick={() => setDialogs({})}>Cancel</Button>
            <Button variant="destructive" disabled={deleting} onClick={confirmDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
