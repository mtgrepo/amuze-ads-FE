import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Info, MoreHorizontal, Trash2, UserSearch, VenusAndMars } from "lucide-react";
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
import { useAdSetDeleteCommand } from "../../../Composable/Command/content/adSet/useAdSetDeleteCommand";
import type { AdSetResponse } from "../../../dto/response/content/adSetResponse";
import { cn } from "../../../lib/utils";

export default function AdSetAction({
    id,
    ageMin,
    ageMax,
    gender,
    campaign: { name }
}: AdSetResponse) {
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [detailOpen, setDetailOpen] = React.useState(false);

    const { deleteAdSetCommand } = useAdSetDeleteCommand();

    const handleDelete = async () => {
        await deleteAdSetCommand(id);
        setDeleteOpen(false);
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
                        AdSet Actions
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => setDetailOpen(true)}>
                        <Info className="mr-2 h-4 w-4" />
                        View
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => setDeleteOpen(true)}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* DELETE DIALOG */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Delete ad set?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone.
                            <br />
                            <span className="font-medium text-foreground">
                                {name}
                            </span>{" "}
                            will be permanently removed.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DETAIL VIEW */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent
                    className="max-w-2xl p-0 rounded-2xl bg-background overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* HEADER */}
                    <div className="px-8 py-5 border-b border-border bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold tracking-tight text-foreground">
                                Ad Set Info
                            </h2>
                        </div>

                        <p className="text-xs text-muted-foreground mt-1">
                            {/* Created {new Date(createdAt).toLocaleDateString()} */}
                        </p>
                    </div>

                    {/* BODY */}
                    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-5">

                        {/* AGE */}
                        <section className="space-y-4 pb-8 border-b border-border">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <UserSearch className="h-4 w-4 text-primary" />
                                    Age Range
                                </label>

                                <span className="text-primary font-medium text-xs bg-primary/10 px-3 py-1 rounded-full border border-border">
                                    {ageMin} – {ageMax} years
                                </span>
                            </div>

                            {/* Range bar */}
                            <div className="space-y-3">
                                <div className="relative h-2 bg-muted rounded-full">

                                    {/* filled */}
                                    <div
                                        className="absolute h-full bg-primary rounded-full"
                                        style={{
                                            left: `${(ageMin / 65) * 100}%`,
                                            width: `${((ageMax - ageMin) / 65) * 100}%`,
                                        }}
                                    />

                                    {/* dots */}
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-background border border-primary"
                                        style={{ left: `${(ageMin / 65) * 100}%` }}
                                    />

                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-background border border-primary"
                                        style={{ left: `${(ageMax / 65) * 100}%` }}
                                    />
                                </div>

                                {/* scale */}
                                <div className="flex justify-between text-[10px] font-medium text-muted-foreground px-1">
                                    {[0, 10, 20, 30, 40, 50, 60, "65+"].map((n, i) => (
                                        <span key={i}>{n}</span>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* GENDER */}
                        <section className="space-y-4 pb-8 border-b border-border">
                            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <VenusAndMars className="h-4 w-4 text-primary" />
                                Gender
                            </label>

                            <div className="grid grid-cols-3 w-full gap-2">
                                {["all", "male", "female"].map((g) => {
                                    const active = gender?.toLowerCase() === g;

                                    return (
                                        <span
                                            key={g}
                                            className={cn(
                                                "px-4 py-1.5 rounded-md text-xs font-medium border transition-colors capitalize",
                                                active
                                                    ? "bg-primary/10 dark:text-primary-foreground text-primary border-primary text-center"
                                                    : "bg-muted text-muted-foreground border-border hover:bg-accent cursor-default text-center"
                                            )}
                                        >
                                            {g}
                                        </span>
                                    );
                                })}
                            </div>
                        </section>

                    </div>
                </DialogContent>
            </Dialog>

        </>
    );
}
