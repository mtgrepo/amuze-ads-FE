import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUpdateAdvertiserStatusCommand } from "../../Composable/Command/advertiser/useUpdateAdvertiserStatusCommand";
import { useAdvertiserVerifyCommand } from "../../Composable/Command/advertiser/useAdvertiserVerifyCommand";

type Target = { id: string; name: string };

const errorText = (err: unknown) => (err instanceof Error ? err.message : "Something went wrong.");

/** Activate, deactivate (with undo) and verify, refreshing both the list and the details page. */
export function useAdvertiserActions() {
    const qc = useQueryClient();
    const { updateAdvertiserStatusCommand, isPending: statusPending } = useUpdateAdvertiserStatusCommand();
    const { verifyAdvertiserCommand, isPending: verifyPending } = useAdvertiserVerifyCommand();
    const refreshDetails = () => qc.invalidateQueries({ queryKey: ["advertiser-details"] });

    const reactivate = async (a: Target, title = `${a.name} is active again`) => {
        try {
            await updateAdvertiserStatusCommand({ id: a.id, status: "active" });
            refreshDetails();
            toast.info(title, { description: "They can sign in and create ads." });
        } catch (err) {
            toast.error("Couldn't reactivate", { description: errorText(err) });
        }
    };

    const deactivate = async (a: Target, liveAds: number) => {
        try {
            await updateAdvertiserStatusCommand({ id: a.id, status: "inactive" });
            refreshDetails();
            toast.success(`${a.name} is deactivated`, {
                description: liveAds ? `Their ${liveAds} live ${liveAds === 1 ? "ad keeps" : "ads keep"} running until they end.` : "They can't sign in or create new ads.",
                action: { label: "Undo", onClick: () => { void reactivate(a, "Undone"); } },
            });
        } catch (err) {
            toast.error("Couldn't deactivate", { description: errorText(err) });
        }
    };

    const verify = async (a: Target) => {
        try {
            await verifyAdvertiserCommand({ id: a.id, verified: true });
            refreshDetails();
            toast.success(`${a.name} is verified`, { description: "Their ads no longer need an extra check." });
        } catch (err) {
            toast.error("Couldn't verify", { description: errorText(err) });
        }
    };

    return { reactivate, deactivate, verify, isPending: statusPending || verifyPending };
}
