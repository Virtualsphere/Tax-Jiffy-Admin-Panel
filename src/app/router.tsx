import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireSuperAdmin } from '@/auth/RequireSuperAdmin'
import { LoginPage } from '@/auth/LoginPage'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ROUTES } from '@/config/routes'
import { UsersPage } from '@/pages/users/UsersPage'
import { GstListPage } from '@/pages/gst/GstListPage'
import { GstDetailPage } from '@/pages/gst/GstDetailPage'
import { InvoicesPage } from '@/pages/invoices/InvoicesPage'
import { LiveActivityPage } from '@/pages/activity/LiveActivityPage'
import { ApiLimitsPage } from '@/pages/api-limits/ApiLimitsPage'
import { OtpUsagePage } from '@/pages/otp-usage/OtpUsagePage'
import { SubscriptionPlansPage } from '@/pages/subscription-plans/SubscriptionPlansPage'

export const router = createBrowserRouter([
  {
    path: ROUTES.login,
    element: <LoginPage />,
  },
  {
    element: <RequireSuperAdmin />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.users} replace /> },
          { path: ROUTES.users, element: <UsersPage /> },
          { path: ROUTES.gst, element: <GstListPage /> },
          { path: '/gst/:id', element: <GstDetailPage /> },
          { path: ROUTES.invoices, element: <InvoicesPage /> },
          { path: ROUTES.activity, element: <LiveActivityPage /> },
          { path: ROUTES.apiLimits, element: <ApiLimitsPage /> },
          { path: ROUTES.otpUsage, element: <OtpUsagePage /> },
          { path: ROUTES.subscriptionPlans, element: <SubscriptionPlansPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.login} replace /> },
])
