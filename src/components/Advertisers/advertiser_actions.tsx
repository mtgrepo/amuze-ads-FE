import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {  InfoIcon, MoreHorizontal } from "lucide-react";
import type { AdvertisersResponse } from "../../dto/response/Advertisers/advertisersResponse";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";


export default function AdvertiserActions({ id }: AdvertisersResponse) {

    // Fetch promo code details at top level
    // const { promoCodeDetails, isLoading, isError: error } = usePromoCodeDetailsQuery(id);
    const navigate = useNavigate();
    const handleViewDetails = () => {
        navigate(`/advertisers/${id}`);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleViewDetails}>
                        <InfoIcon /> View Details
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
