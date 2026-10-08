import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * Returns to the page the user came from inside the portal (e.g. the dashboard or calendar that opened an ad).
 * When the page was opened directly (bookmark, pasted link, new tab) there's nothing to go back to, so it goes to `fallback`.
 */
export default function BackButton({ fallback, label = "Back", className }: {
    fallback: string;
    label?: string;
    className?: string;
}) {
    const navigate = useNavigate();
    const location = useLocation();
    // React Router gives the first page loaded in a tab the key "default".
    const cameFromPortal = location.key !== "default";

    return (
        <button
            type="button"
            onClick={() => (cameFromPortal ? navigate(-1) : navigate(fallback))}
            className={cn("inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground", className)}
        >
            <ArrowLeft className="size-4" /> {label}
        </button>
    );
}
