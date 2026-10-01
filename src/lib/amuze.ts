// Admins sign in through the AMUZE admin portal; this is where they're sent when not signed in,
// when their token expires, or when they log out.
export const AMUZE_ADMIN_PORTAL_URL: string | undefined = import.meta.env.VITE_AMUZE_ADMIN_PORTAL_URL;

export function goToAmuzeAdmin() {
    if (AMUZE_ADMIN_PORTAL_URL) {
        window.location.replace(AMUZE_ADMIN_PORTAL_URL);
    }
}
