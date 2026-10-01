import { useEffect } from "react";
import { useSelector } from "react-redux";
import type { ReactNode } from "react";
import type { RootState } from "../redux/store/store";
import { AMUZE_ADMIN_PORTAL_URL, goToAmuzeAdmin } from "../lib/amuze";

type Props = {
  children: ReactNode;
};

// Admins sign in through the AMUZE admin portal (see /sso), so there's no local login page.
export function ProtectedRoute({ children }: Props) {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  useEffect(() => {
    if (!isAuthenticated) goToAmuzeAdmin();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6 text-center text-sm text-muted-foreground">
        {AMUZE_ADMIN_PORTAL_URL
          ? "Redirecting to the AMUZE admin portal…"
          : "Please open the Ad portal from the AMUZE admin portal."}
      </div>
    );
  }
  return <>{children}</>;
}
