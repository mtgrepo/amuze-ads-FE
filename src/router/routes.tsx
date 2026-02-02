import { createBrowserRouter } from "react-router-dom"

import App from "../App"
import Dashboard from "../features/Dashboard/dashboard"
import Advertisers from "../features/Advertisers/advertisers"
import LoginPage from "../features/Auth/login"
import Ads from "../features/Content/Ads/ads"

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
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
                path: "ads",
                element: <Ads />,
                handle: { crumb: ["Content", "Ads"] },
            }
        ],
    },

    // outside layout (no sidebar/header)
    {
        path: "/login",
        element: <LoginPage />,
    },
])

export default router
