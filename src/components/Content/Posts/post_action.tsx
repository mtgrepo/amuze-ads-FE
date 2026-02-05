import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClipboardPenLine, MoreHorizontal, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../ui/button";
import DrawerFormLayout from "../../Common/Layout/drawer_form_layout";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import type { PostResponse } from "../../../dto/response/content/postResponse";
import PostForm from "./post_form";
import { usePostDeleteCommand } from "../../../Composable/Command/content/posts/usePostDeleteCommand";

export default function PostActions({ id, advertiser_id, title, description, status, photo }: PostResponse) {
    const [editOpen, setEditOpen] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);

    const [_formData, setFormData] = useState({ id, advertiser_id, title, description, status, photo });

    const handleEditClick = () => {
        setEditOpen(true);
        setFormData({ id, advertiser_id, title, description, status, photo });
    }

    const { deletePostCommand} = usePostDeleteCommand();
    const handleDelete = async (id: string) => {
        await deletePostCommand(id);
        setDeleteOpen(false)
    }

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
                    <DropdownMenuItem onClick={handleEditClick}>
                        <ClipboardPenLine /> Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
                        <Trash2 /> Delete Post
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Drawer */}
            <DrawerFormLayout
                open={editOpen}
                setOpen={setEditOpen}
                title="Edit Post"
                description="Update post below."
                formContent={
                    <PostForm
                        mode="edit"
                        defaultValues={{
                            id,
                            advertiser_id,
                            title,
                            description,
                            status,
                            photo
                        }}

                        onSuccess={() => setEditOpen(false)}
                    />
                }
                cancelButton={
                    <Button variant="outline" className="w-full my-3">
                        Cancel
                    </Button>
                }
            />

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-100">
                    <DialogHeader>
                        <DialogTitle>Delete Post</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{title}</strong>?
                            <br />
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={() => {
                                handleDelete(id)
                                setDeleteOpen(false)
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
