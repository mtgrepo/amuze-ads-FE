import { useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
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
        <div className="flex min-h-svh flex-col items-center justify-center gap-[18px] bg-background p-6 text-foreground">
            <section className="flex w-full max-w-[420px] flex-col items-center gap-4 rounded-[18px] border bg-card p-8 text-center">
                <div className="flex size-11 items-center justify-center rounded-[11px] bg-primary text-xl font-bold text-primary-foreground" aria-hidden="true">A</div>
                {error ? (
                    <>
                        <h1 className="text-xl font-semibold">We couldn't sign you in</h1>
                        <p className="leading-normal text-muted-foreground">{error}</p>
                        {!/admin portal/i.test(error) && (
                            <p className="leading-normal text-muted-foreground">Open the Ads portal again from the AMUZE admin portal.</p>
                        )}
                        {AMUZE_ADMIN_PORTAL_URL && (
                            <div className="flex flex-wrap justify-center gap-2.5">
                                <Button className="h-10 px-4" onClick={goToAmuzeAdmin}>Back to AMUZE admin</Button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div role="status" aria-label="Signing in" className="size-7 animate-spin rounded-full border-[3px] border-primary/15 border-t-primary" />
                        <h1 className="text-xl font-semibold">Signing you in with AMUZE</h1>
                        <p className="leading-normal text-muted-foreground">This takes a second. You'll land on the dashboard.</p>
                    </>
                )}
            </section>
            <span className="text-xs text-muted-foreground">Amuze Ads · Admin portal</span>
        </div>
    )
}
