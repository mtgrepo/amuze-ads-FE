/** Display names for campaign and ad statuses. The backend values stay as they are (e.g. "pending"). */
export const STATUS_LABELS: Record<string, string> = {
    draft: "Draft",
    pending: "Under Review",
    active: "Active",
    paused: "Paused",
    rejected: "Rejected",
    expired: "Expired",
};

export function statusLabel(status?: string | null): string {
    if (!status) return "";
    return STATUS_LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1);
}
