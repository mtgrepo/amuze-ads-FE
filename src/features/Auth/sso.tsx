import { useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { GalleryVerticalEnd } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { loginSuccess } from "../../redux/auth/authSlice"
import { adminSso } from "../../http/apis/auth/ssoApi"
import { AMUZE_ADMIN_PORTAL_URL, goToAmuzeAdmin } from "../../lib/amuze"

/**
 * Entry point from the AMUZE admin portal: /sso#token=<AMUZE admin JWT>.
 * The token is in the fragment so it never reaches any server log; it's removed from the
 * address bar immediately, checked by our backend, then used for API calls like a normal login.
 */
export default function SsoPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    // React StrictMode runs effects twice in development; sign in only once.
    const started = useRef(false)

    useEffect(() => {
        if (started.current) return
        started.current = true

        const token = new URLSearchParams(window.location.hash.slice(1)).get("token")
        // Drop the token from the address bar and browser history right away.
        window.history.replaceState(null, "", window.location.pathname)

        if (!token) {
            setError("No sign-in token was provided. Open the Ad portal from the AMUZE admin portal.")
            return
        }

        adminSso(token)
            .then((response) => {
                // Backend responses are wrapped as { success, message, data }.
                dispatch(loginSuccess({ user: response?.data?.user, token, isAuthenticated: true }))
                navigate("/", { replace: true })
            })
            .catch((err: Error) => setError(err.message))
    }, [dispatch, navigate])

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
                <div className="flex items-center gap-2 font-medium">
                    <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    Amuze Ad
                </div>

                {error ? (
                    <>
                        <div className="space-y-1">
                            <p className="font-medium">Couldn't sign you in</p>
                            <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                        {AMUZE_ADMIN_PORTAL_URL && (
                            <Button onClick={goToAmuzeAdmin}>Back to AMUZE admin</Button>
                        )}
                    </>
                ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Spinner /> Signing you in…
                    </div>
                )}
            </div>
        </div>
    )
}
