import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import { contactRouteElement, featureRouteElement, homeRouteElement, loginRouteElement, pricingRouteElement, registerRouteElement } from './routeElements'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        index: true,
        element: homeRouteElement,
      },
      {
        path: '/login',
        element: loginRouteElement,
      },
      {
        path: '/register',
        element: registerRouteElement,
      },
      {
        path: '/contact',
        element: contactRouteElement,
      },
      {
        path: '/features',
        element: featureRouteElement,
      },
      {
        path: '/pricing',
        element: pricingRouteElement,
      },
    ],
  },
])

export default router
