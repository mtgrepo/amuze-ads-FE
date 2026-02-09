import { createBrowserRouter } from "react-router-dom"

import App from "../App"
import Dashboard from "../features/Dashboard/dashboard"
import Advertisers from "../features/Advertisers/advertisers"
import LoginPage from "../features/Auth/login"
import Ads from "../features/Content/Ads/ads"
import NotFound from "../components/Common/notfound_component"
import AdvertiserDetailsPage from "../features/Advertisers/advertiser_details"
import { ProtectedRoute, PublicRoute } from "./guard"
import AdminUsers from "../features/System/AdminUsers/admin_users"
import PostPage from "../features/Content/Posts/post"
import ProfilePage from "../features/AdvertiserProfile/profile"
import AdSetPage from "../features/Content/AdSet/ad_set"
import CampaignPage from "../features/Content/Campaign/campaign"

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

            // advertisers
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
            // advertiser profiles
            {
                path: "advertiser-profiles",
                element: <ProfilePage />,
                handle: { crumb: ['Advertiser', 'Profiles'] },
            },
            // content -> post
            {
                path: "content/posts",
                element: <PostPage />,
                handle: { crumb: ["Content", "Posts"] },
            },
            // ads
            {
                path: "ads",
                element: <Ads />,
                handle: { crumb: ["Content", "Ads"] },
            },
            // ad-sets
            {
                path: "ad-sets",
                element: <AdSetPage />,
                handle: { crumb: ["Content", "Ad Sets"] },
            },
            {
                path: "campaigns",
                element: <CampaignPage />,
                handle: { crumb: ["Content", "Campaigns"] },
            },
            // admin users
            {
                path: "/admin-users",
                element: <AdminUsers />,
                handle: { crumb: ["System", "Admin Users"] },
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
