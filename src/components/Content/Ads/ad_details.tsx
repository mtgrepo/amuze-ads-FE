import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { useState } from "react";
import { CreditCard, MapPin, UserSearch, VenusAndMars } from "lucide-react";
import type { AdResponse } from "../../../dto/response/content/adResponse";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import BudgetForm from "./budget_form";
import CampaignExtensions from "./campaign_extensions";
import PaymentDialog from "../Payment/payment_dialog";

import { statusLabel } from "../../../lib/status";
interface Props {
    data: AdResponse;
}

const statusVariant = (status: string) => {
    if (status === "active") return "bg-green-600/10 text-green-600 border-green-600/30";
    if (status === "pending") return "bg-yellow-600/10 text-yellow-600 border-yellow-600/30";
    if (status === "rejected") return "bg-destructive/10 text-destructive border-destructive/30";
    return "bg-muted text-muted-foreground border-border";
};

export default function AdDetails({ data }: Props) {
    const [payOpen, setPayOpen] = useState(false);
    if (!data) return <p>No data available</p>;

    const { adType, placementKey, status, adSet, adCreative } = data;
    const { campaign } = adSet;
    const { advertiser } = campaign;

    return (
        <div className="max-w-5xl w-full mx-auto p-8 space-y-6">
            {/* HEADER */}
            <Card className="rounded-2xl shadow-sm">
                <CardContent className="flex items-center justify-between p-6">
                    <div>
                        <h1 className="text-2xl font-bold capitalize">{adType} · {placementKey}</h1>
                        <p className="text-muted-foreground mt-1">Campaign: {campaign?.name}</p>
                    </div>
                    <Badge className={cn(statusVariant(status))} variant="outline">
                        {statusLabel(status)}
                    </Badge>
                </CardContent>
            </Card>

            {status === "draft" && campaign && (
                <Card className="rounded-2xl shadow-sm border-primary/30 bg-primary/5">
                    <CardContent className="p-6 flex items-center justify-between gap-4 text-sm">
                        <span>This ad is a draft. Pay to publish it.</span>
                        <Button size="sm" onClick={() => setPayOpen(true)}>
                            <CreditCard className="h-4 w-4" /> Pay
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* CREATIVE */}
            <Card className="rounded-2xl shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle>Creative</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {adCreative?.assetType === "video" ? (
                        <video src={adCreative.asset} controls className="w-full max-h-96 object-contain bg-black rounded-lg" />
                    ) : (
                        <img src={adCreative?.asset} alt={adCreative?.name} className="w-full max-h-96 object-contain rounded-lg border" />
                    )}
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <a href={adCreative?.destinationLink} target="_blank" rel="noreferrer" className="text-primary underline break-all">
                            {adCreative?.destinationLink}
                        </a>
                    </div>
                </CardContent>
            </Card>

            {/* TARGETING */}
            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle>Targeting</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold">
                            <UserSearch className="h-4 w-4 text-primary" />
                            Age Range
                        </label>
                        <p className="text-sm text-muted-foreground">{adSet?.ageMin} – {adSet?.ageMax} years</p>
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold">
                            <VenusAndMars className="h-4 w-4 text-primary" />
                            Gender
                        </label>
                        <p className="text-sm text-muted-foreground capitalize">{adSet?.gender}</p>
                    </div>
                </CardContent>
            </Card>

            {/* CAMPAIGN */}
            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle>Campaign</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm font-semibold">Status</p>
                        <p className="text-sm text-muted-foreground">{statusLabel(campaign?.status)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Model Type</p>
                        <p className="text-sm text-muted-foreground capitalize">{campaign?.modelType}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Spent Amount</p>
                        <p className="text-sm text-muted-foreground">{campaign?.spentAmount}</p>
                    </div>
                </CardContent>
            </Card>

            {/* BUDGET — editable only while draft */}
            {campaign && <BudgetForm campaign={campaign} />}

            {campaign && <CampaignExtensions campaign={campaign} isAdmin />}

            {status === "draft" && campaign && (
                <PaymentDialog
                    open={payOpen}
                    onOpenChange={setPayOpen}
                    campaignId={campaign.id}
                    campaignName={campaign.name}
                    amount={campaign.totalBudget}
                />
            )}

            {/* ADVERTISER */}
            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle>Advertiser</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm font-semibold">Name</p>
                        <p className="text-sm text-muted-foreground">{advertiser?.name}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Email</p>
                        <p className="text-sm text-muted-foreground">{advertiser?.email}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Phone</p>
                        <p className="text-sm text-muted-foreground">{advertiser?.phone}</p>
                    </div>
                    {advertiser?.profiles?.[0] && (
                        <>
                            <div>
                                <p className="text-sm font-semibold">Business Name</p>
                                <p className="text-sm text-muted-foreground">{advertiser.profiles[0].business_name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Business Type</p>
                                <p className="text-sm text-muted-foreground">{advertiser.profiles[0].business_type}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Website</p>
                                <p className="text-sm text-muted-foreground break-all">{advertiser.profiles[0].website}</p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
