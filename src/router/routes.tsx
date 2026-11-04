import { createBrowserRouter } from "react-router-dom"

import App from "../App"
import Dashboard from "../features/Dashboard/dashboard"
import Advertisers from "../features/Advertisers/advertisers"
import SsoPage from "../features/Auth/sso"
import Ads from "../features/Content/Ads/ads"
import AdDetailsPage from "../features/Content/Ads/ad_details"
import CreateAdPage from "../features/Content/Ads/create_ad"
import NotFound from "../components/Common/notfound_component"
import AdvertiserDetailsPage from "../features/Advertisers/advertiser_details"
import { ProtectedRoute } from "./guard"
import AdminUsers from "../features/System/AdminUsers/admin_users"
import SystemConfigs from "../features/System/SystemConfigs/system_configs"
import ProfilePage from "../features/AdvertiserProfile/profile"
import AdSetPage from "../features/Content/AdSet/ad_set"
import CampaignPage from "../features/Content/Campaign/campaign"
import NotificationsPage from "../features/Notifications/notifications"
import DailyAdStats from "@/features/Performance/daily_ad_stats"
import TransactionsPage from "../features/Financial/Transactions/transactions"
import PointsPage from "../features/Financial/Points/points"
import AdPackagesPage from "../features/AdPackages/ad_packages"
import CalendarPage from "../features/Calendar/calendar"

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
                handle: { crumb: ["Accounts", "Advertisers"] },
            },
            {
                path: "advertisers/:id",
                element: <AdvertiserDetailsPage />,
                handle: {
                    crumb: [
                        "Accounts",
                        { label: "Advertisers", href: "/advertisers" },
                        { label: "Details" }
                    ]
                }
            },
            // advertiser profiles
            {
                path: "advertiser-profiles",
                element: <ProfilePage />,
                handle: { crumb: ["Accounts", "Advertiser profiles"] },
            },
            // ads
            {
                path: "ads",
                element: <Ads />,
                handle: { crumb: ["Ad management", "Ads"] },
            },
            {
                path: "calendar",
                element: <CalendarPage />,
                handle: { crumb: ["Ad management", "Calendar"] },
            },
            {
                path: "ads/create",
                element: <CreateAdPage />,
                handle: {
                    crumb: [
                        "Ad management",
                        { label: "Ads", href: "/ads" },
                        { label: "Create" }
                    ]
                },
            },
            {
                path: "ads/:id",
                element: <AdDetailsPage />,
                handle: {
                    crumb: [
                        "Ad management",
                        { label: "Ads", href: "/ads" },
                        { label: "Details" }
                    ]
                },
            },
            // ad-sets
            {
                path: "ad-sets",
                element: <AdSetPage />,
                handle: { crumb: ["Ad management", "Ad sets"] },
            },
            {
                path: "campaigns",
                element: <CampaignPage />,
                handle: { crumb: ["Ad management", "Campaigns"] },
            },
            // Notifications 
            {
                path: "notifications",
                element: <NotificationsPage />,
                handle: { crumb: ["Inbox", "Notifications"] },
            },
            // admin users
            {
                path: "/admin-users",
                element: <AdminUsers />,
                handle: { crumb: ["Settings", "Admin users"] },
            },
            // system configs
            {
                path: "system-configs",
                element: <SystemConfigs />,
                handle: { crumb: ["Settings", "System configs"] },
            },
            // daily ads stats
            {
                path: "daily-ads-status",
                element: <DailyAdStats />,
                handle: { crumb: ["Performance"] },
            },
            // ad packages
            {
                path: "packages",
                element: <AdPackagesPage />,
                handle: { crumb: ["Ad management", "Packages"] },
            },
            // points
            {
                path: "points",
                element: <PointsPage />,
                handle: { crumb: ["Accounts", "Points"] },
            },
            // transactions
            {
                path: "transactions",
                element: <TransactionsPage />,
                handle: { crumb: ["Accounts", "Transactions"] },
            },
            {
                path: "*",
                element: <NotFound />
            }
        ],
    },

    // outside layout (no sidebar/header)
    // Admins arrive here from the AMUZE admin portal: /sso#token=<AMUZE admin JWT>.
    // Not restricted to signed-out users, so a different admin arriving in the same browser still signs in.
    {
        path: "/sso",
        element: <SsoPage />,
    },
])

export default router
