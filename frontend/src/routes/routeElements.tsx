// Lazy-loaded dashboard and page route elements
import { Suspense, lazy } from 'react'
import type { ReactElement } from 'react'
import { AuthSplitSkeleton, ContactSkeleton, FeatureSkeleton, HomeSkeleton, PricingSkeleton } from '../components/skeletons/PageSkeletons'
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton'

const withSuspense = (element: ReactElement, fallback?: ReactElement) => (
  <Suspense fallback={fallback ?? <HomeSkeleton />}>
    {element}
  </Suspense>
)

const createLazyRouteElement = (
  importer: () => Promise<{ default: React.ComponentType }>,
  fallback?: ReactElement,
) => {
  const LazyPage = lazy(importer)
  return withSuspense(<LazyPage />, fallback)
}

export const homeRouteElement = createLazyRouteElement(() => import('../pages/home'), <HomeSkeleton />)
export const dashboardRouteElement = createLazyRouteElement(() => import('../pages/dashboard'))
export const loginRouteElement = createLazyRouteElement(() => import('../pages/Auth/login'), <AuthSplitSkeleton variant="login" />)
export const registerRouteElement = createLazyRouteElement(() => import('../pages/Auth/register'), <AuthSplitSkeleton variant="register" />)
export const forgotPasswordRouteElement = createLazyRouteElement(() => import('../pages/Auth/forgot-password'))
export const verifyCodeRouteElement = createLazyRouteElement(() => import('../pages/Auth/verify-code'))
export const resetPasswordRouteElement = createLazyRouteElement(() => import('../pages/Auth/reset-password'))
export const contactRouteElement = createLazyRouteElement(() => import('../pages/contact'), <ContactSkeleton />)
export const featureRouteElement = createLazyRouteElement(() => import('../pages/feature'), <FeatureSkeleton />)
export const pricingRouteElement = createLazyRouteElement(() => import('../pages/pricing'), <PricingSkeleton />)
export const tenantsRouteElement = createLazyRouteElement(() => import('../pages/superadmin/tenants'), <DashboardSkeleton />)
export const superadminsRouteElement = createLazyRouteElement(() => import('../pages/superadmin/superadmins'), <DashboardSkeleton />)
export const plansRouteElement = createLazyRouteElement(() => import('../pages/superadmin/plans'), <DashboardSkeleton />)
export const subscriptionsRouteElement = createLazyRouteElement(() => import('../pages/superadmin/subscriptions'), <DashboardSkeleton />)
export const inquiriesRouteElement = createLazyRouteElement(() => import('../pages/superadmin/inquiries'), <DashboardSkeleton />)
export const settingsRouteElement = createLazyRouteElement(() => import('../pages/settings'), <DashboardSkeleton />)
export const recordsRouteElement = createLazyRouteElement(() => import('../pages/records'), <DashboardSkeleton />)
export const requestsRouteElement = createLazyRouteElement(() => import('../pages/requests'), <DashboardSkeleton />)
export const consentRouteElement = createLazyRouteElement(() => import('../pages/consent'), <DashboardSkeleton />)
export const emergencyRouteElement = createLazyRouteElement(() => import('../pages/emergency'), <DashboardSkeleton />)
export const scheduleRouteElement = createLazyRouteElement(() => import('../pages/schedule'), <DashboardSkeleton />)
export const auditRouteElement = createLazyRouteElement(() => import('../pages/audit'), <DashboardSkeleton />)
export const staffRouteElement = createLazyRouteElement(() => import('../pages/staff'), <DashboardSkeleton />)
export const profileRouteElement = createLazyRouteElement(() => import('../pages/profile'))
export const changePasswordRouteElement = createLazyRouteElement(() => import('../pages/change-password'))
export const trashRouteElement = createLazyRouteElement(() => import('../pages/superadmin/trash'))
