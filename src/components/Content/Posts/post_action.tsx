import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClipboardPenLine, Info, MoreHorizontal, Trash2 } from "lucide-react";
import React from "react";
import { Button } from "../../ui/button";
import DrawerFormLayout from "../../Common/Layout/drawer_form_layout";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../../ui/dialog";
import type { PostResponse } from "../../../dto/response/content/postResponse";
import PostForm from "./post_form";
import { usePostDeleteCommand } from "../../../Composable/Command/content/posts/usePostDeleteCommand";
import { Badge } from "../../ui/badge";
import { cn } from "../../../lib/utils";

export default function PostActions({
    id,
    advertiser_id,
    title,
    description,
    status,
    photo,
    advertiser: { name },
}: PostResponse) {
    const [editOpen, setEditOpen] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [detailOpen, setDetailOpen] = React.useState(false);

    const { deletePostCommand } = usePostDeleteCommand();

    const handleDelete = async () => {
        await deletePostCommand(id);
        setDeleteOpen(false);
    };

    /*  enterprise row  */
    const InfoRow = ({ label, value }: { label: string; value?: string }) => (
        <div className="grid grid-cols-3 w-full border-b text-sm">
            <div className="px-4 py-2 text-muted-foreground font-medium">{label}</div>
            <div className="col-span-2 px-4 py-2 font-semibold wrap-break-word">
                {value || "—"}
            </div>
        </div>
    );

    let iconColor;
    if (status === "active") {
        iconColor = "text-green-500";
    } else if (status === "disabled") {
        iconColor = "text-yellow-500";
    } else {
        iconColor = "text-red-500";
    }

    return (
        <>
            {/*  ACTION MENU  */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-md hover:bg-muted"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-40 rounded-md border shadow-sm">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                        ACTIONS
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

            {/*  EDIT DRAWER  */}
            <DrawerFormLayout
                open={editOpen}
                setOpen={setEditOpen}
                title="Edit Post"
                description="Update post information"
                formContent={
                    <PostForm
                        mode="edit"
                        defaultValues={{
                            id,
                            advertiser_id,
                            title,
                            description,
                            status,
                            photo,
                        }}
                        onSuccess={() => setEditOpen(false)}
                    />
                }
                cancelButton={<Button variant="outline" className="w-full">Cancel</Button>}
            />

            {/*  DELETE  */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-md rounded-md">
                    <DialogHeader>
                        <DialogTitle>Delete Post</DialogTitle>
                        <DialogDescription>
                            This permanently deletes <strong>{title}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/*  DETAIL VIEW  */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-2xl rounded-md p-0 overflow-hidden">

                    {/* header */}
                    <div className="flex items-center justify-between border-b bg-muted/40 px-6 py-4">
                        <div>
                            <div className="flex flex-row gap-2 justify-center items-center">
                                <p className="font-semibold">
                                    {title}
                                </p>
                                <Badge variant={'outline'} className={cn(iconColor)}>
                                    {status?.toUpperCase()}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Post Details</p>
                        </div>
                    </div>

                    {/*  thumbnail */}
                    {photo && (
                        <div className="border-b p-4">
                            <img
                                src={photo}
                                alt={title}
                                className="max-h-60 w-full rounded-md border object-cover"
                            />
                        </div>
                    )}

                    {/* body (spec layout) */}
                    <div className="divide-y">
                        <InfoRow label="Advertiser ID" value={name} />
                        <InfoRow label="Title" value={title} />
                        <InfoRow label="Status" value={status} />
                        <InfoRow label="Description" value={description} />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
