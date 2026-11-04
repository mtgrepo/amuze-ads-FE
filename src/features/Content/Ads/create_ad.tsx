import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateAdForm from "../../../components/Content/Ads/create_ad_form";
import type { CreatedAd } from "../../../components/Content/Ads/create_ad_form";
import PaymentDialog from "../../../components/Content/Payment/payment_dialog";

export default function CreateAdPage() {
    const navigate = useNavigate();
    // Set once the draft is saved via Pay; opens the payment step. Pay or "Pay later" both end on the ads list.
    const [created, setCreated] = useState<CreatedAd | null>(null);

    return (
        <div className="flex w-full flex-1 flex-col">
            <CreateAdForm
                onCreated={(ad, intent) => (intent === "pay" ? setCreated(ad) : navigate("/ads"))}
            />
            {created && (
                <PaymentDialog
                    open
                    onOpenChange={(open) => { if (!open) navigate("/ads"); }}
                    campaignId={created.campaign.id}
                    campaignName={created.campaign.name}
                    amount={created.campaign.totalBudget}
                />
            )}
        </div>
    )
}
