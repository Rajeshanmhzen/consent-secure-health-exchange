import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import { contactRouteElement, featureRouteElement, homeRouteElement, loginRouteElement, pricingRouteElement, registerRouteElement, forgotPasswordRouteElement, verifyCodeRouteElement, resetPasswordRouteElement, dashboardRouteElement, tenantsRouteElement, superadminsRouteElement, plansRouteElement, subscriptionsRouteElement, inquiriesRouteElement, settingsRouteElement, recordsRouteElement, requestsRouteElement, consentRouteElement, emergencyRouteElement, scheduleRouteElement, auditRouteElement, staffRouteElement, profileRouteElement, changePasswordRouteElement, trashRouteElement } from './routeElements'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', index: true, element: homeRouteElement },
      { path: '/login', element: loginRouteElement },
      { path: '/register', element: registerRouteElement },
      { path: '/forgot-password', element: forgotPasswordRouteElement },
      { path: '/verify-code', element: verifyCodeRouteElement },
      { path: '/reset-password', element: resetPasswordRouteElement },
      { path: '/contact', element: contactRouteElement },
      { path: '/features', element: featureRouteElement },
      { path: '/pricing', element: pricingRouteElement },
    ],
  },
  { path: '/dashboard', element: dashboardRouteElement },
  { path: '/dashboard/tenants', element: tenantsRouteElement },
  { path: '/dashboard/superadmins', element: superadminsRouteElement },
  { path: '/dashboard/plans', element: plansRouteElement },
  { path: '/dashboard/subscriptions', element: subscriptionsRouteElement },
  { path: '/dashboard/inquiries', element: inquiriesRouteElement },
  { path: '/dashboard/settings', element: settingsRouteElement },
  { path: '/dashboard/records', element: recordsRouteElement },
  { path: '/dashboard/requests', element: requestsRouteElement },
  { path: '/dashboard/consent', element: consentRouteElement },
  { path: '/dashboard/emergency', element: emergencyRouteElement },
  { path: '/dashboard/schedule', element: scheduleRouteElement },
  { path: '/dashboard/audit', element: auditRouteElement },
  { path: '/dashboard/staff', element: staffRouteElement },
  { path: '/dashboard/profile', element: profileRouteElement },
  { path: '/dashboard/change-password', element: changePasswordRouteElement },
  { path: '/dashboard/trash', element: trashRouteElement },
])

export default router
