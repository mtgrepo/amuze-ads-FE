import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarPlus, Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { AdResponse } from "../../../dto/response/content/adResponse";
import { EXTENDABLE_CAMPAIGN_STATUSES } from "../../../dto/response/campaignExtension/campaignExtensionResponse";
import { ExtendDialog } from "./campaign_extensions";

/** The ⋯ at the end of an ads-list row: open the ad's page, or extend it when it can be. */
export function AdRowActions({ ad }: { ad: AdResponse }) {
    const navigate = useNavigate();
    const [extendOpen, setExtendOpen] = useState(false);
    const campaign = ad.adSet.campaign;
    const canExtend = EXTENDABLE_CAMPAIGN_STATUSES.includes(campaign.status);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${campaign.name}`}>
                        <MoreHorizontal className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => navigate(`/ads/${ad.id}`)}>
                        <Eye /> View
                    </DropdownMenuItem>
                    {canExtend && (
                        <DropdownMenuItem onClick={() => setExtendOpen(true)}>
                            <CalendarPlus /> Extend
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            {extendOpen && <ExtendDialog campaign={campaign} isAdmin open={extendOpen} onOpenChange={setExtendOpen} />}
        </>
    );
}
