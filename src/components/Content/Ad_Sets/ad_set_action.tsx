import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClipboardPenLine, Info, MoreHorizontal, Tags, Trash2, UserSearch, VenusAndMars } from "lucide-react";
import React from "react";
import { Button } from "../../ui/button";
import DrawerFormLayout from "../../Common/Layout/drawer_form_layout";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../ui/dialog";
import { usePostDeleteCommand } from "../../../Composable/Command/content/posts/usePostDeleteCommand";
import type { AdSetResponse } from "../../../dto/response/content/adSetResponse";
import AdSetForm from "./ad_set_form";
import { cn } from "../../../lib/utils";
import { Separator } from "../../ui/separator";

export default function AdSetAction({
    id,
    campaignId,
    ageMin,
    ageMax,
    gender,
    location,
    category,
    campaign: { name }
}: AdSetResponse) {
    const [editOpen, setEditOpen] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [detailOpen, setDetailOpen] = React.useState(false);

    const { deletePostCommand } = usePostDeleteCommand();

    const handleDelete = async () => {
        await deletePostCommand(id);
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

                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        <ClipboardPenLine className="mr-2 h-4 w-4" />
                        Edit
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

            {/* EDIT DRAWER */}
            <DrawerFormLayout
                open={editOpen}
                setOpen={setEditOpen}
                title="Edit Ad Set"
                description="Update ad set information"
                formContent={
                    <AdSetForm
                        mode="edit"
                        defaultValues={{
                            id,
                            campaignId: campaignId,
                            ageMin: ageMin,
                            ageMax: ageMax,
                            gender,
                            location,
                            category,
                        }}
                        onSuccess={() => setEditOpen(false)}
                    />
                }
                cancelButton={
                    <Button variant="outline" className="w-full rounded-xl">
                        Cancel
                    </Button>
                }
            />

            {/* DELETE DIALOG */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Delete post?</DialogTitle>
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
                    className="max-w-2xl p-0 rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/*  HEADER  */}
                    <div className="px-8 py-4 my-4 border-b border-[#283339]">
                        <div className="flex flex-row gap-2 ">
                            <Info className="items-center justify-center my-auto text-primary" />
                            <h2 className="text-2xl font-bold tracking-tight">
                                Ad Set Info
                            </h2>
                        </div>

                        <p className="text-slate-400 text-sm mt-1">
                            {/* Created {new Date(createdAt).toLocaleDateString()} */}
                        </p>
                    </div>

                    {/*  BODY  */}
                    <div className="flex-1 overflow-y-auto px-8  space-y-8">

                        {/*  AGE  */}
                        <section className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="flex flex-row gap-2 text-sm font-semibold items-center ">
                                  <UserSearch className="text-primary"/>  Age Range
                                </label>

                                <div className="text-primary font-bold text-sm bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                    {ageMin} – {ageMax} years
                                </div>
                            </div>

                            {/* visual range bar */}
                            <div className="space-y-3">

                                {/* BAR + DOTS */}
                                <div className="relative h-2 bg-slate-800 rounded-full overflow-visible">

                                    {/* filled range */}
                                    <div
                                        className="absolute h-full bg-primary rounded-full"
                                        style={{
                                            left: `${(ageMin / 65) * 100}%`,
                                            width: `${((ageMax - ageMin) / 65) * 100}%`,
                                        }}
                                    />

                                    {/* MIN DOT */}
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-lg"
                                        style={{ left: `${(ageMin / 65) * 100}%` }}
                                    />

                                    {/* MAX DOT */}
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-lg"
                                        style={{ left: `${(ageMax / 65) * 100}%` }}
                                    />
                                </div>

                                {/* SCALE NUMBERS */}
                                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 px-1">
                                    {[0, 10, 20, 30, 40, 50, 60, "65+"].map((n, i) => (
                                        <span key={i}>{n}</span>
                                    ))}
                                </div>

                            </div>
                        </section>

                        <Separator />

                        {/*  GENDER  */}
                        <section className="space-y-3">
                            <label className="text-sm font-semibold flex flex-row gap-2">
                               <VenusAndMars className="my-auto items-center justify-center font-bold text-primary/80"/> Gender
                            </label>

                            <div className="flex flex-wrap gap-2">
                                {["all", "male", "female"].map((g) => {
                                    const active = gender?.toLowerCase() === g;

                                    return (
                                        <span
                                            key={g}
                                            className={cn(
                                                "px-5 py-2 mt-3 rounded-xl text-xs font-bold border border-dashed transition",
                                                active
                                                    ? "border-primary text-white shadow-lg shadow-primary/20"
                                                    : " text-slate-400 border-[#283339]"
                                            )}
                                        >
                                            {g}
                                        </span>
                                    );
                                })}
                            </div>
                        </section>

                        <Separator />

                        {/*  CATEGORY  */}
                        <section className="space-y-3">
                            <label className="flex flex-row gap-2 text-sm font-semibold">
                              <Tags className="my-auto items-center justify-center font-bold text-primary/80"/>  Category
                            </label>

                            <div className="w-full flex flex-wrap gap-2 my-3 border-dashed">
                                <span className="px-3 py-2 rounded-xl text-xs font-bold border border-dashed border-primary text-white shadow-lg shadow-primary/20">{category}</span>
                            </div>
                        </section>
                    </div>

                </DialogContent>
            </Dialog>
        </>
    );
}
