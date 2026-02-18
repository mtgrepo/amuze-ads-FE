import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BriefcaseBusiness, CheckCircle, ClipboardPenLine, Info, MoreHorizontal, Settings, Trash2 } from "lucide-react";
import React from "react";
import { Button } from "../../ui/button";
import DrawerFormLayout from "../../Common/Layout/drawer_form_layout";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../ui/dialog";
import type { PostResponse } from "../../../dto/response/content/postResponse";
import PostForm from "./post_form";
import { usePostDeleteCommand } from "../../../Composable/Command/content/posts/usePostDeleteCommand";
import { useUpdatePostStatusCommand } from "../../../Composable/Command/content/posts/useUpdatePostStatusCommand";
import { Badge } from "../../ui/badge";
import { cn } from "../../../lib/utils";

export default function PostActions({
    id,
    advertiser_id,
    title,
    description,
    status,
    photo,
    createdAt,
    advertiser: { name },
}: PostResponse) {
    const [editOpen, setEditOpen] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [approveOpen, setApproveOpen] = React.useState(false);
    const [detailOpen, setDetailOpen] = React.useState(false);

    const { deletePostCommand } = usePostDeleteCommand();
    const { updatePostStatusCommand } = useUpdatePostStatusCommand();

    const handleDelete = async () => {
        await deletePostCommand(id);
        setDeleteOpen(false);
    };

    const handleApprove = async () => {
        await updatePostStatusCommand({ id, status: "active" });
        setApproveOpen(false);
    };

    /*  STATUS STYLES  */
    const statusStyles = {
        active: "bg-green-500/10 text-green-600 border-green-200",
        disabled: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
        default: "bg-red-500/10 text-red-600 border-red-200",
    };

    let iconColor;

    if (status === "active") {
        iconColor = "text-green-600";
    } else if (status === "disabled") {
        iconColor = "text-yellow-600";
    } else {
        iconColor = "text-red-600";
    }

    const badgeStyle = statusStyles[status as keyof typeof statusStyles] || statusStyles.default;

      const InfoRow = ({
        label,
        value,
        icon,
        type,
      }: {
        label: string;
        value?: string;
        icon?: React.ReactNode;
        type?: string;
      }) => (
        <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-4">
          <div className="text-muted-foreground mt-0.5">{icon}</div>
    
          <div className="flex flex-col text-sm">
            <span className="text-xs text-muted-foreground">{label}</span>
    
            {type === "status" && value ? (
              <p className={cn("font-bold wrap-break-word", iconColor)}>{value.toUpperCase()}</p>
            ) : (
              <span className="font-medium wrap-break-word">{value || "—"}</span>
            )}
          </div>
        </div>
      );

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
                        Post Actions
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

                    {status !== "active" && (
                        <DropdownMenuItem onClick={() => setApproveOpen(true)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                        </DropdownMenuItem>
                    )}

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
                                {title}
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

            {/* APPROVE DIALOG */}
            <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Approve post?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve{" "}
                            <span className="font-medium text-foreground">
                                {title}
                            </span>
                            ? This will set the post status to active.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setApproveOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleApprove}>
                            Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DETAIL VIEW */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-2xl p-0 rounded-2xl overflow-hidden shadow-xl">

                    {/* HEADER */}
                    <div className="px-6 py-5 border-b bg-muted/30 flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold">{title}</h2>
                            <p className="text-xs text-muted-foreground">
                                {new Date(createdAt).toLocaleString()}
                            </p>
                        </div>

                        <Badge variant="outline" className={cn("capitalize", badgeStyle)}>
                            {status}
                        </Badge>
                    </div>

                    {/* IMAGE */}
                    {photo && (
                        <img
                            src={photo}
                            alt={title}
                            className="w-full max-h-72 object-cover"
                        />
                    )}

                    {/* DESCRIPTION */}
                    {description && (
                        <div className="px-6 py-4 text-sm text-muted-foreground leading-relaxed">
                            {description}
                        </div>
                    )}

                    {/* DETAILS */}
                    <div className="grid grid-cols-2 gap-4 p-6 pt-0">
                        <InfoRow label="Advertiser" value={name} icon={<BriefcaseBusiness className="text-primary"/>} />
                        <InfoRow label="Status" value={status} icon={<Settings className="text-primary"/>} type="status"/>
                    </div>

                    <div className="px-6 pb-6">
                        <DialogClose asChild>
                            <Button className="w-full rounded-xl" variant="outline">
                                Close
                            </Button>
                        </DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
