import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ban, CheckCircle, ClipboardPenLine, InfoIcon, MoreHorizontal, Power, Trash2 } from "lucide-react";
import type { AdvertisersResponse } from "../../dto/response/advertisers/advertisersResponse";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import DrawerFormLayout from "../Common/Layout/drawer_form_layout";
import AdvertiserForm from "./advertiser_form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useAdvertiserDeleteCommand } from "../../Composable/Command/advertiser/useAdvertiserDeleteCommand";
import { useAdvertiserVerifyCommand } from "../../Composable/Command/advertiser/useAdvertiserVerifyCommand";
import { useUpdateAdvertiserStatusCommand } from "../../Composable/Command/advertiser/useUpdateAdvertiserStatusCommand";

export default function AdvertiserActions({ id, name, email, phone, status, verified, password }: AdvertisersResponse) {
    const [editOpen, setEditOpen] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [verifyOpen, setVerifyOpen] = React.useState(false);
    const [statusOpen, setStatusOpen] = React.useState(false);

    const [_formData, setFormData] = useState({ id, name, email, phone, status, verified, password });

    const qc = useQueryClient();
    const navigate = useNavigate();

    const { deleteAdvertiserCommand } = useAdvertiserDeleteCommand();
    const { verifyAdvertiserCommand } = useAdvertiserVerifyCommand();
    const { updateAdvertiserStatusCommand } = useUpdateAdvertiserStatusCommand();

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

    const handleVerify = async () => {
        await verifyAdvertiserCommand({ id, verified: true });
        setVerifyOpen(false);
    }

    const isActive = status === "active";

    const handleStatusChange = async () => {
        await updateAdvertiserStatusCommand({ id, status: isActive ? "inactive" : "active" });
        setStatusOpen(false);
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

                    {!verified && (
                        <DropdownMenuItem
                            onClick={() => setVerifyOpen(true)}
                            className="cursor-pointer"
                        >
                            <CheckCircle /> Verify
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                        onClick={() => setStatusOpen(true)}
                        className="cursor-pointer"
                    >
                        {isActive ? <Ban /> : <Power />}
                        {isActive ? "Deactivate" : "Activate"}
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

            {/* Verify Dialog */}
            <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Verify advertiser?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to verify{" "}
                            <span className="font-medium text-foreground">
                                {name}
                            </span>
                            ? This will mark the advertiser as verified.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setVerifyOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleVerify}>
                            Verify
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Status Dialog */}
            <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>{isActive ? "Deactivate" : "Activate"} advertiser?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {isActive ? "deactivate" : "activate"}{" "}
                            <span className="font-medium text-foreground">
                                {name}
                            </span>
                            ?
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setStatusOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant={isActive ? "destructive" : "default"}
                            onClick={handleStatusChange}
                        >
                            {isActive ? "Deactivate" : "Activate"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
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
