import { Suspense, lazy } from 'react'
import type { ReactElement } from 'react'
import { AuthSplitSkeleton, ContactSkeleton, FeatureSkeleton, HomeSkeleton } from '../components/skeletons/PageSkeletons'

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
export const loginRouteElement = createLazyRouteElement(
  () => import('../pages/Auth/login'),
  <AuthSplitSkeleton variant="login" />,
)
export const registerRouteElement = createLazyRouteElement(
  () => import('../pages/Auth/register'),
  <AuthSplitSkeleton variant="register" />,
)
export const contactRouteElement = createLazyRouteElement(
  () => import('../pages/contact'),
  <ContactSkeleton />,
)
export const featureRouteElement = createLazyRouteElement(
  () => import('../pages/feature'),
  <FeatureSkeleton />,
)
