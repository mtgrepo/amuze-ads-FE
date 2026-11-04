import { TriangleAlert } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import type { AdvertiserKind } from "./advertiser_utils";
import { pts } from "./advertiser_utils";

interface Props {
    name: string;
    kind: AdvertiserKind;
    liveAds: number;
    /** Wallet balance; undefined for agency clients or while loading. */
    balance?: number;
    open: boolean;
    pending?: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

/** Confirms a deactivation, saying what happens to live ads and points. */
export function DeactivateDialog({ name, kind, liveAds, balance, open, pending, onOpenChange, onConfirm }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent role="alertdialog" showCloseButton={false} className="flex w-[min(460px,100%)] flex-col gap-3.5 rounded-2xl bg-card p-[22px] sm:max-w-[460px]">
                <div className="flex size-10 items-center justify-center rounded-full bg-destructive-soft text-destructive-soft-foreground">
                    <TriangleAlert className="size-5" aria-hidden="true" />
                </div>
                <DialogTitle className="text-lg font-semibold">Deactivate {name}?</DialogTitle>
                <DialogDescription asChild>
                    <div className="flex flex-col gap-1.5 text-sm leading-normal text-foreground/80">
                        <span>· {kind === "client" ? "No new ads can be created for them." : "They can't sign in or create new ads."}</span>
                        <span>· Their <span className="font-mono tabular-nums">{liveAds}</span> live {liveAds === 1 ? "ad keeps" : "ads keep"} running until their end dates.</span>
                        {kind === "client"
                            ? <span>· You can reactivate them any time.</span>
                            : <span>· Their {balance !== undefined ? <span className="font-mono tabular-nums">{pts(balance)}</span> : "points"} stay in the wallet. You can reactivate them any time.</span>}
                    </div>
                </DialogDescription>
                <div className="mt-1.5 flex justify-end gap-2.5">
                    <Button variant="outline" className="bg-card" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button variant="destructive" disabled={pending} onClick={onConfirm}>Deactivate</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
