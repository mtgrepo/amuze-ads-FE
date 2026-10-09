import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { CalendarPlus, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Spinner } from "../../ui/spinner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { cn } from "../../../lib/utils";
import { useCampaignExtensionsQuery, useExtensionQuoteQuery } from "../../../Composable/Query/campaignExtension/useCampaignExtensionQuery";
import { useCampaignExtensionCommands } from "../../../Composable/Command/campaignExtension/useCampaignExtensionCommands";
import {
    EXTENDABLE_CAMPAIGN_STATUSES,
    EXTENSION_STATUS_LABELS,
    type CampaignExtensionResponse,
} from "../../../dto/response/campaignExtension/campaignExtensionResponse";

interface ExtendableCampaign {
    id: string;
    name: string;
    status: string;
    endDate: Date | string;
}

const toDateString = (value: Date | string) =>
    typeof value === "string" ? value.slice(0, 10) : format(value, "yyyy-MM-dd");

const parseDay = (value: string) => {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
};

const addDays = (value: string, days: number) => {
    const date = parseDay(value);
    date.setDate(date.getDate() + days);
    return format(date, "yyyy-MM-dd");
};

const shortDate = (value: string) => format(parseDay(value), "d MMM yyyy");

/** First extra day: the day after the current end, or today if the campaign has already ended. */
function firstExtraDay(endDate: string): string {
    const dayAfter = addDays(endDate, 1);
    const today = format(new Date(), "yyyy-MM-dd");
    return dayAfter > today ? dayAfter : today;
}

const STATUS_STYLE: Record<CampaignExtensionResponse["status"], string> = {
    pending: "text-amber-700 dark:text-amber-400",
    approved: "text-emerald-700 dark:text-emerald-400",
    rejected: "text-muted-foreground",
};

function ExtendDialog({ campaign, isAdmin, open, onOpenChange }: {
    campaign: ExtendableCampaign;
    isAdmin: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const endDate = toDateString(campaign.endDate);
    const firstDay = firstExtraDay(endDate);
    const [newEndDate, setNewEndDate] = useState(() => addDays(firstDay, 6));
    const { quote, isFetching, error } = useExtensionQuoteQuery(campaign.id, newEndDate, open);
    const { requestExtension, isRequesting } = useCampaignExtensionCommands();

    const shortfall = quote ? Math.max(quote.amount - quote.balance, 0) : 0;
    const canSubmit = !!quote && shortfall === 0 && !isFetching;
    const isExpired = campaign.status === "expired";

    const submit = async () => {
        try {
            await requestExtension({ campaignId: campaign.id, newEndDate });
            onOpenChange(false);
        } catch {
            // The command already shows why.
        }
    };

    return (
        <Dialog open={open} onOpenChange={(next) => { if (!isRequesting) onOpenChange(next); }}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Extend campaign</DialogTitle>
                    <DialogDescription>
                        {isExpired
                            ? `"${campaign.name}" ended on ${shortDate(endDate)}. It restarts today and runs until the new end date.`
                            : `"${campaign.name}" ends on ${shortDate(endDate)}. Choose how long it should keep running.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <label htmlFor="new-end-date" className="text-sm font-medium">New end date</label>
                    <Input
                        id="new-end-date"
                        type="date"
                        min={firstDay}
                        value={newEndDate}
                        onChange={(e) => e.target.value && setNewEndDate(e.target.value)}
                    />
                    <div className="flex gap-1.5">
                        {[7, 14, 30].map((days) => (
                            <Button key={days} type="button" size="sm" variant="outline" className="h-7 text-xs"
                                onClick={() => setNewEndDate(addDays(firstDay, days - 1))}>
                                +{days} days
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border p-4 space-y-2 text-sm">
                    {error ? (
                        <p className="text-destructive">{error.message}</p>
                    ) : !quote ? (
                        <p className="text-muted-foreground">{isFetching ? "Pricing…" : "Pick a new end date"}</p>
                    ) : (
                        <>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Extra period</span>
                                <span>{shortDate(quote.startDate)} – {shortDate(quote.newEndDate)} ({quote.days} {quote.days === 1 ? "day" : "days"})</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Rate</span>
                                <span className="tabular-nums">{quote.dailyRate.toLocaleString()} pts / day</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="text-muted-foreground">Cost</span>
                                <span className="text-lg font-semibold tabular-nums">{quote.amount.toLocaleString()} pts</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{isAdmin ? `${quote.payerName}'s balance` : "Your balance"}</span>
                                <span className={cn("tabular-nums", shortfall > 0 && "text-destructive")}>{quote.balance.toLocaleString()} pts</span>
                            </div>
                        </>
                    )}
                </div>

                {quote && shortfall > 0 && (
                    <p className="text-sm text-destructive">
                        Not enough points: {shortfall.toLocaleString()} more needed.{" "}
                        {isAdmin ? (
                            "Top up their points first."
                        ) : (
                            <Link to="/points" className="font-medium underline" onClick={() => onOpenChange(false)}>Buy points</Link>
                        )}
                    </p>
                )}

                {!isAdmin && (
                    <p className="text-xs text-muted-foreground">
                        Amuze reviews extensions. If it's rejected, these points are refunded. Your current run isn't affected either way.
                    </p>
                )}

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isRequesting}>Cancel</Button>
                    <Button onClick={submit} disabled={!canSubmit || isRequesting}>
                        {isRequesting ? <Spinner /> : <CalendarPlus className="h-4 w-4" />}
                        {isAdmin ? "Extend now" : "Pay and submit"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Extensions of one campaign: extend it, see one under review, and its history.
 * Admins also approve or reject the pending one; their own extensions apply at once.
 */
export default function CampaignExtensions({ campaign, isAdmin = false }: { campaign: ExtendableCampaign; isAdmin?: boolean }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { extensions, isLoading } = useCampaignExtensionsQuery(campaign.id);
    const { approveExtension, rejectExtension, isReviewing } = useCampaignExtensionCommands();

    const pending = extensions.find((e) => e.status === "pending");
    const canExtend = EXTENDABLE_CAMPAIGN_STATUSES.includes(campaign.status) && !pending;

    if (!EXTENDABLE_CAMPAIGN_STATUSES.includes(campaign.status) && extensions.length === 0) return null;

    return (
        <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle>Extensions</CardTitle>
                {canExtend && (
                    <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
                        <CalendarPlus className="h-4 w-4" /> Extend
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {pending && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
                        <div>
                            <div className="font-medium">Extension to {shortDate(pending.newEndDate)} is under review</div>
                            <div className="text-muted-foreground">
                                {pending.days} {pending.days === 1 ? "day" : "days"} · {pending.amount.toLocaleString()} pts held
                                {isAdmin ? "" : " · refunded if it's rejected"}
                            </div>
                        </div>
                        {isAdmin && (
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" disabled={isReviewing} onClick={() => rejectExtension(pending.id).catch(() => undefined)}>
                                    <X className="h-4 w-4" /> Reject
                                </Button>
                                <Button size="sm" disabled={isReviewing} onClick={() => approveExtension(pending.id).catch(() => undefined)}>
                                    <Check className="h-4 w-4" /> Approve
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {isLoading ? (
                    <div className="h-10 animate-pulse rounded bg-muted" />
                ) : extensions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {campaign.status === "expired"
                            ? "This campaign has ended. Extend it to run it again."
                            : `No extensions yet. Extend to keep it running past ${shortDate(toDateString(campaign.endDate))}.`}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-muted-foreground">
                                    <th className="pb-2 font-normal">Extra period</th>
                                    <th className="pb-2 pl-4 text-right font-normal">Days</th>
                                    <th className="pb-2 pl-4 text-right font-normal">Cost</th>
                                    <th className="pb-2 pl-4 font-normal">Status</th>
                                    <th className="pb-2 pl-4 text-right font-normal">Requested</th>
                                </tr>
                            </thead>
                            <tbody>
                                {extensions.map((e) => (
                                    <tr key={e.id} className="border-t">
                                        <td className="py-2.5 whitespace-nowrap">{shortDate(e.startDate)} – {shortDate(e.newEndDate)}</td>
                                        <td className="py-2.5 pl-4 text-right tabular-nums">{e.days}</td>
                                        <td className="py-2.5 pl-4 text-right tabular-nums">{e.amount.toLocaleString()} pts</td>
                                        <td className={cn("py-2.5 pl-4 whitespace-nowrap", STATUS_STYLE[e.status])}>{EXTENSION_STATUS_LABELS[e.status]}</td>
                                        <td className="py-2.5 pl-4 text-right text-muted-foreground whitespace-nowrap">{format(new Date(e.createdAt), "d MMM yyyy")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>

            {dialogOpen && (
                <ExtendDialog campaign={campaign} isAdmin={isAdmin} open={dialogOpen} onOpenChange={setDialogOpen} />
            )}
        </Card>
    );
}
