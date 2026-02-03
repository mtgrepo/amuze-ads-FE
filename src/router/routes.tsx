import { createBrowserRouter } from "react-router-dom"

import App from "../App"
import Dashboard from "../features/Dashboard/dashboard"
import Advertisers from "../features/Advertisers/advertisers"
import LoginPage from "../features/Auth/login"
import Ads from "../features/Content/Ads/ads"
import NotFound from "../components/Common/notfound_component"
import AdvertiserDetailsPage from "../features/Advertisers/advertiser_details"
import { ProtectedRoute, PublicRoute } from "./guard"

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <App />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Dashboard />,
                handle: { crumb: "Dashboard" },
            },
            {
                path: "advertisers",
                element: <Advertisers />,
                handle: { crumb: "Advertisers" },
            },
            {
                path: "advertisers/:id",
                element: <AdvertiserDetailsPage />,
                handle: {
                    crumb: [
                        { label: "Advertisers", href: "/advertisers" },
                        { label: "Details" }
                    ]
                }
            },
            {
                path: "ads",
                element: <Ads />,
                handle: { crumb: ["Content", "Ads"] },
            },
            {
                path: "*",
                element: <NotFound />
            }
        ],
    },

    // outside layout (no sidebar/header)
    {
        path: "/login",
        element: (
            <PublicRoute>
                <LoginPage />
            </PublicRoute>
        ),
    },
])

export default router
