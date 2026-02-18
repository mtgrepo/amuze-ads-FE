import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleCheck, MoreHorizontal, Pause } from "lucide-react";
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

export default function AdsActions({ id, status }: { id: string; status: string }) {
    const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);

    const { updateAdStatusCommand, isPending } = useUpdateAdStatusCommand();

    const isActive = status === "active";
    const newStatus = isActive ? "paused" : "active";

    const handleChangeStatus = async () => {
        await updateAdStatusCommand({ id, status: newStatus });
        setStatusDialogOpen(false);
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
                </DropdownMenuContent>
            </DropdownMenu>

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
        </>
    );
}
