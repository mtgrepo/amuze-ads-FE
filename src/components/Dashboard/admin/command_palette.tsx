import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandShortcut,
} from "@/components/ui/command";
import { useAdListQuery } from "../../../Composable/Query/content/useAdListQuery";
import type { AdResponse } from "../../../dto/response/content/adResponse";
import { statusLabel } from "../../../lib/status";

const PAGES = [
    { label: "Ads", to: "/ads" },
    { label: "Performance", to: "/daily-ads-status" },
    { label: "Advertisers", to: "/advertisers" },
    { label: "Packages", to: "/packages" },
    { label: "Points", to: "/points" },
    { label: "Transactions", to: "/transactions" },
    { label: "Notifications", to: "/notifications" },
];

/** "Search or jump to…": ads by name, common actions and pages. Ctrl/⌘ K opens it. */
export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { adListData } = useAdListQuery();
    const ads = (adListData ?? []) as AdResponse[];

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setOpen((o) => !o);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const go = (to: string) => { setOpen(false); navigate(to); };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex h-9 w-64 items-center gap-2 rounded-lg border bg-card px-3 text-sm text-muted-foreground hover:bg-accent"
            >
                <Search className="size-4" />
                Search or jump to…
                <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">Ctrl K</kbd>
            </button>
            <CommandDialog open={open} onOpenChange={setOpen} title="Search or jump to" description="Find an ad, an action or a page">
                <CommandInput placeholder="Search ads, advertisers, pages…" />
                <CommandList>
                    <CommandEmpty>Nothing matches.</CommandEmpty>
                    <CommandGroup heading="Actions">
                        <CommandItem onSelect={() => go("/ads/create")}>Create an ad<CommandShortcut>Ad management</CommandShortcut></CommandItem>
                        <CommandItem onSelect={() => go("/packages")}>Add a package<CommandShortcut>Packages</CommandShortcut></CommandItem>
                        <CommandItem onSelect={() => go("/points")}>Top up an advertiser's points<CommandShortcut>Points</CommandShortcut></CommandItem>
                    </CommandGroup>
                    <CommandGroup heading="Ads">
                        {ads.slice(0, 50).map((ad) => (
                            <CommandItem
                                key={ad.id}
                                value={`${ad.adSet.campaign.name} ${ad.adSet.campaign.advertiser?.name ?? ""} ${ad.id}`}
                                onSelect={() => go(`/ads/${ad.id}`)}
                            >
                                {ad.adSet.campaign.name}
                                <CommandShortcut>{statusLabel(ad.status)}</CommandShortcut>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandGroup heading="Go to">
                        {PAGES.map((p) => <CommandItem key={p.to} onSelect={() => go(p.to)}>{p.label}</CommandItem>)}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
