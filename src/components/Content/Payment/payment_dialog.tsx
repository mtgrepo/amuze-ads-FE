import { Coins } from "lucide-react";
import { Button } from "../../ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../ui/dialog";
import { Spinner } from "../../ui/spinner";
import { cn } from "../../../lib/utils";
import { usePayCampaignCommand } from "../../../Composable/Command/content/campaign/usePayCampaignCommand";
import { usePaymentInfoQuery } from "../../../Composable/Query/content/usePaymentInfoQuery";

interface PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    campaignId: string;
    campaignName: string;
    // Shown until the server's payment info loads; the server always charges the stored total.
    amount: number;
    onPaid?: () => void;
}

// Admin pays with the customer's points (the agency's for agency clients); the ad goes live immediately.
export default function PaymentDialog({ open, onOpenChange, campaignId, campaignName, amount, onPaid }: PaymentDialogProps) {
    const { payCampaignCommand, isPending } = usePayCampaignCommand();
    const { paymentInfo, isLoading, isError } = usePaymentInfoQuery(campaignId, open);

    const total = paymentInfo?.amount ?? Number(amount);
    const balance = paymentInfo?.balance ?? 0;
    const shortfall = Math.max(total - balance, 0);
    const canPay = !!paymentInfo && shortfall === 0;

    const handlePay = async () => {
        try {
            await payCampaignCommand(campaignId);
            onPaid?.();
            onOpenChange(false);
        } catch {
            // The command's onError already shows the reason.
        }
    };

    return (
        <Dialog open={open} onOpenChange={(next) => { if (!isPending) onOpenChange(next); }}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Payment</DialogTitle>
                    <DialogDescription>
                        "{campaignName}" is saved as a draft. Once paid with points, the ad goes live immediately.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-xl border p-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Paid by</span>
                        <span className="font-medium">{isLoading ? "…" : paymentInfo?.payerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="text-lg font-bold">{total.toLocaleString()} points</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Balance</span>
                        <span className={cn("font-medium", shortfall > 0 && "text-destructive")}>
                            {isLoading ? "…" : `${balance.toLocaleString()} points`}
                        </span>
                    </div>
                </div>

                {isError && (
                    <p className="text-sm text-destructive">Couldn't load the payer's balance. Close this and try again.</p>
                )}

                {paymentInfo && shortfall > 0 && (
                    <p className="text-sm text-destructive">
                        Not enough points — {shortfall.toLocaleString()} more needed. Add points to {paymentInfo.payerName} from the Advertisers list first.
                    </p>
                )}

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Pay later
                    </Button>
                    <Button onClick={handlePay} disabled={isPending || !canPay}>
                        {isPending ? <Spinner /> : <Coins className="h-4 w-4" />}
                        Pay with points
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
