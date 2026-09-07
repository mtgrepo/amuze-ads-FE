import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, CircleCheck, Info, MapPin, MoreHorizontal, Pause, XCircle } from "lucide-react";
import React from "react";
import { Button } from "../../ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../ui/dialog";
import { useUpdateAdStatusCommand } from "../../../Composable/Command/content/ads/useUpdateAdStatusCommand";
import { useAdApproveCommand } from "../../../Composable/Command/content/ads/useAdApproveCommand";
import { useAdRejectCommand } from "../../../Composable/Command/content/ads/useAdRejectCommand";
import type { AdResponse } from "../../../dto/response/content/adResponse";

export default function AdsActions({ id, status, adType, placementKey, adSet, adCreative }: AdResponse) {
    const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
    const [approveOpen, setApproveOpen] = React.useState(false);
    const [rejectOpen, setRejectOpen] = React.useState(false);
    const [detailOpen, setDetailOpen] = React.useState(false);

    const { updateAdStatusCommand, isPending } = useUpdateAdStatusCommand();
    const { approveAdCommand, isPending: isApproving } = useAdApproveCommand();
    const { rejectAdCommand, isPending: isRejecting } = useAdRejectCommand();

    const isActive = status === "active";
    const newStatus = isActive ? "paused" : "active";

    const handleChangeStatus = async () => {
        await updateAdStatusCommand({ id, status: newStatus });
        setStatusDialogOpen(false);
    };

    const handleApprove = async () => {
        await approveAdCommand(id);
        setApproveOpen(false);
    };

    const handleReject = async () => {
        await rejectAdCommand(id);
        setRejectOpen(false);
    };

    return (
        <>
            {/* ACTION MENU */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-muted transition"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    className="w-44 rounded-xl shadow-lg"
                >
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Ad Actions
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => setDetailOpen(true)}>
                        <Info className="mr-2 h-4 w-4" />
                        View
                    </DropdownMenuItem>

                    {status === "pending" && (
                        <>
                            <DropdownMenuItem onClick={() => setApproveOpen(true)} className="text-green-600 focus:text-green-600">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRejectOpen(true)} className="text-destructive focus:text-destructive">
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                            </DropdownMenuItem>
                        </>
                    )}

                    {(status === "active" || status === "paused") && (
                        <DropdownMenuItem
                            onClick={() => setStatusDialogOpen(true)}
                            className={isActive ? "text-yellow-600 focus:text-yellow-600" : "text-green-600 focus:text-green-600"}
                        >
                            {isActive ? (
                                <>
                                    <Pause className="mr-2 h-4 w-4" />
                                    Pause
                                </>
                            ) : (
                                <>
                                    <CircleCheck className="mr-2 h-4 w-4" />
                                    Activate
                                </>
                            )}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* APPROVE DIALOG */}
            <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Approve ad?</DialogTitle>
                        <DialogDescription>
                            This will set the ad status to active and allow it to start serving.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setApproveOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleApprove}
                            disabled={isApproving}
                        >
                            {isApproving ? 'Approving...' : 'Approve'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* REJECT DIALOG */}
            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Reject ad?</DialogTitle>
                        <DialogDescription>
                            This will set the ad status to rejected.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setRejectOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject} disabled={isRejecting}>
                            {isRejecting ? 'Rejecting...' : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CHANGE STATUS DIALOG */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {isActive ? "Pause ad?" : "Activate ad?"}
                        </DialogTitle>
                        <DialogDescription>
                            {isActive
                                ? "This ad will be paused and will stop serving."
                                : "This ad will be activated and start serving."}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className={
                                isActive
                                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                                    : "bg-green-600 hover:bg-green-700 text-white"
                            }
                            onClick={handleChangeStatus}
                            disabled={isPending}
                        >
                            {isPending
                                ? "Updating..."
                                : isActive
                                    ? "Pause"
                                    : "Activate"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DETAIL VIEW */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-lg p-0 rounded-2xl overflow-hidden shadow-xl">
                    <div className="px-6 py-5 border-b bg-muted/30">
                        <h2 className="text-lg font-semibold capitalize">{adType} · {placementKey}</h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            Campaign: {adSet?.campaign?.name} — Status: {status}
                        </p>
                    </div>

                    {adCreative?.assetType === 'video' ? (
                        <video src={adCreative.asset} controls className="w-full max-h-72 object-cover bg-black" />
                    ) : (
                        <img src={adCreative?.asset} alt={adCreative?.name} className="w-full max-h-72 object-cover" />
                    )}

                    <div className="px-6 py-4 flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <a href={adCreative?.destinationLink} target="_blank" rel="noreferrer" className="text-primary underline break-all">
                            {adCreative?.destinationLink}
                        </a>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
