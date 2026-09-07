import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowRight, BriefcaseBusiness, Calendar1, CheckCircle, Info, LetterText, Megaphone, MoreHorizontal, Trash2, UserStarIcon, Wallet, XCircle } from "lucide-react";
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
import { useCampaignApproveCommand } from "../../../Composable/Command/content/campaign/useCampaignApproveCommand";
import { useCampaignRejectCommand } from "../../../Composable/Command/content/campaign/useCampaignRejectCommand";
import { useCampaignDeleteCommand } from "../../../Composable/Command/content/campaign/useCampaignDeleteCommand";
import { cn } from "../../../lib/utils";
import type { CampaignResponse } from "../../../dto/response/content/campaignResponse";

export default function CampaignActions({
    id,
    name,
    dailyBudget,
    totalBudget,
    spentAmount,
    startDate,
    endDate,
    status,
    createdAt,
    advertiser,
    post
}: CampaignResponse) {
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [detailOpen, setDetailOpen] = React.useState(false);
    const [approveOpen, setApproveOpen] = React.useState(false);
    const [rejectOpen, setRejectOpen] = React.useState(false);

    const { deleteCampaignCommand } = useCampaignDeleteCommand();
    const { approveCampaignCommand, isPending: isApproving } = useCampaignApproveCommand();
    const { rejectCampaignCommand, isPending: isRejecting } = useCampaignRejectCommand();

    const handleDelete = async () => {
        await deleteCampaignCommand(id!);
        setDeleteOpen(false);
    };

    const handleApprove = async () => {
        await approveCampaignCommand(id!);
        setApproveOpen(false);
    };

    const handleReject = async () => {
        await rejectCampaignCommand(id!);
        setRejectOpen(false);
    };

    /*  STATUS STYLES  */
    const statusStyles: Record<string, string> = {
        active: "bg-green-500/10 text-green-600 border-green-200",
        completed: "bg-green-500/10 text-green-600 border-green-200",
        paused: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
        pending: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
        rejected: "bg-red-500/10 text-red-600 border-red-200",
        draft: "bg-gray-500/10 text-gray-600 border-gray-200",
    };

    const badgeClass =
        statusStyles[status?.toLowerCase()] ??
        "bg-gray-100 text-gray-600 border-gray-200";

    const spentPercent = spentAmount / totalBudget * 100;
    const start = new Date();
    const end = new Date(endDate);

    const remainingDay = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
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
                        Campaign Actions
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => setDetailOpen(true)}>
                        <Info className="mr-2 h-4 w-4" />
                        View
                    </DropdownMenuItem>

                    {status?.toLowerCase() === 'pending' && (
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
                        <DialogTitle>Delete campaign?</DialogTitle>
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


            {/* APPROVE DIALOG */}
            <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Approve campaign?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve this campaign?
                            <br />
                            <span className="font-medium text-foreground">
                                {name}
                            </span>{" "}
                            will be set to active.
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
                        <DialogTitle>Reject campaign?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reject{" "}
                            <span className="font-medium text-foreground">
                                {name}
                            </span>
                            ? This will set the campaign status to rejected.
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

            {/* DETAIL VIEW */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-2xl p-0 rounded-3xl overflow-hidden shadow-2xl">

                    {/* HEADER */}
                    <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                        <div>
                            <div className="flex flex-row gap-2">
                                <Megaphone className="my-auto justify-center text-center text-primary"/>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {name}
                                </h2>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                                Created on {new Date(createdAt).toLocaleDateString()} • Campaign ID: {id.toString().slice(0, 8)}
                            </p>
                        </div>
                        <div
                            className={cn(
                                "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border",
                                badgeClass
                            )}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {status}
                        </div>
                    </div>

                    {/* CONTENT */}
                    <div className="px-8 py-6 space-y-8">

                        {/* BUDGET SECTION */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-primary text-xl"><Wallet /></span>
                                <h3 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-widest">
                                    Budget Allocation
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Daily Budget */}
                                <div className="flex flex-col gap-1 rounded-lg p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Daily Budget</p>
                                    <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">{dailyBudget.toLocaleString()}</p>
                                </div>
                                {/* Total Budget */}
                                <div className="flex flex-col gap-1 rounded-lg p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Total Budget</p>
                                    <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">{totalBudget.toLocaleString()}</p>
                                </div>
                                {/* Spent */}
                                <div className="flex flex-col gap-1 rounded-lg p-5 bg-primary/5 dark:bg-primary/10 border border-primary/20">
                                    <p className="text-primary dark:text-primary text-xs font-medium uppercase tracking-wide">Spent Amount</p>
                                    <p className="text-primary dark:text-primary text-2xl font-bold leading-tight">{spentAmount.toLocaleString()}</p>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div className="bg-primary h-full rounded-full" style={{ width: `${spentPercent}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* PERIOD + INFO SECTION */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Period */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-primary text-xl"><Calendar1 /></span>
                                    <h3 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-widest">Campaign Period</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                        <div>
                                            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">Start Date</p>
                                            <p className="text-slate-900 dark:text-white font-semibold">{new Date(startDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center justify-center px-2 pt-5">
                                            <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">End Date</p>
                                            <p className="text-slate-900 dark:text-white font-semibold">{new Date(endDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm px-1">Remaining: {remainingDay} days</p>
                                </div>
                            </section>

                            {/* Campaign Info */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-primary text-xl"><BriefcaseBusiness /></span>
                                    <h3 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-widest">Advertiser Info</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                        <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400"><UserStarIcon /></span>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">Advertiser</p>
                                            <p className="text-slate-900 dark:text-white text-sm font-medium">{advertiser?.name}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>
                        <section className="w-full">
                                <div className="flex flex-1 items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-primary text-xl"><Info /></span>
                                    <h3 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-widest">Post Info</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-3">

                                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                        <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            {/* <img src={post?.photo!} className="w-full h-full object-cover rounded" /> */}
                                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400"><LetterText /></span>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">Post Title</p>
                                            <p className="text-slate-900 dark:text-white text-sm font-medium">{post ? post.title : "— (no post attached, e.g. a Display Ads campaign)"}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                    </div>

                </DialogContent>
            </Dialog>
        </>
    );
}
