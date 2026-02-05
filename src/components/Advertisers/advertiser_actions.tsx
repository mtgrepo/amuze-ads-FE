import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClipboardPenLine, InfoIcon, MoreHorizontal, Trash2 } from "lucide-react";
import type { AdvertisersResponse } from "../../dto/response/advertisers/advertisersResponse";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import DrawerFormLayout from "../Common/Layout/drawer_form_layout";
import AdvertiserForm from "./advertiser_form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useAdvertiserDeleteCommand } from "../../Composable/Command/advertiser/useAdvertiserDeleteCommand";

export default function AdvertiserActions({ id, name, email, phone, status, verified, password }: AdvertisersResponse) {
    const [editOpen, setEditOpen] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);

    const [_formData, setFormData] = useState({ id, name, email, phone, status, verified, password });

    const qc = useQueryClient();
    const navigate = useNavigate();

    const { deleteAdvertiserCommand } = useAdvertiserDeleteCommand();

    const handleEditClick = () => {
        setEditOpen(true);
        setFormData({ id, name, email, phone, status, verified, password });
    }

    const handleViewDetails = () => {
        navigate(`/advertisers/${id}`);
    };

    const handleDelete = async (id: string) => {
        await deleteAdvertiserCommand(id);
        setDeleteOpen(false)
        qc.invalidateQueries({ queryKey: ['advertisers'] })
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
                <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel>Advertiser Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={handleViewDetails}
                        className="cursor-pointer"
                    >
                        <InfoIcon /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={handleEditClick}
                        className="cursor-pointer"
                    >
                        <ClipboardPenLine /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={() => setDeleteOpen(true)}
                        className="cursor-pointer"
                    >
                        <Trash2 className="text-destructive focus:text-destructive "/> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Drawer */}
            <DrawerFormLayout
                open={editOpen}
                setOpen={setEditOpen}
                title="Edit Advertiser"
                description="Update advertiser information below."
                formContent={
                    <AdvertiserForm
                        mode="edit"
                        defaultValues={{
                            id,
                            name,
                            email,
                            phone,
                            status,
                            verified,
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
                        <DialogTitle>Delete Demand Schedule</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{name}</strong>?
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
