import { CreditCard } from "lucide-react";
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
import { usePayCampaignCommand } from "../../../Composable/Command/content/campaign/usePayCampaignCommand";

// Until the KBZPay gateway is integrated, paying just records a KBZPay transaction.
const PAYMENT_METHOD = "KBZPay";

interface PaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    campaignId: string;
    campaignName: string;
    amount: number;
    onPaid?: () => void;
}

export default function PaymentDialog({ open, onOpenChange, campaignId, campaignName, amount, onPaid }: PaymentDialogProps) {
    const { payCampaignCommand, isPending } = usePayCampaignCommand();

    const handlePay = async () => {
        await payCampaignCommand(campaignId);
        onPaid?.();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Payment</DialogTitle>
                    <DialogDescription>
                        Your ad "{campaignName}" is saved as a draft. Once paid, the ad goes live immediately.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-xl border p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="text-lg font-bold">{Number(amount).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Method</span>
                        <span className="font-medium">{PAYMENT_METHOD}</span>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Pay later
                    </Button>
                    <Button onClick={handlePay} disabled={isPending}>
                        {isPending ? <Spinner /> : <CreditCard className="h-4 w-4" />}
                        Pay with {PAYMENT_METHOD}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
