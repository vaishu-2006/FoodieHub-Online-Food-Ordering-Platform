import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/': 'Good food, good mood',
  '/restaurants': 'Explore the menu',
  '/cart': 'Your bag',
  '/checkout': 'Checkout',
  '/login': 'Sign in',
  '/register': 'Create an account',
  '/orders': 'Your orders',
  '/profile': 'Your profile',
  '/admin': 'Admin dashboard',
}

export default function usePageTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    const title = pageTitles[pathname]
      || (pathname.startsWith('/restaurant/') ? 'A local favorite' : pathname.startsWith('/orders/') ? 'Track your order' : 'Good food, good mood')
    document.title = `${title} | FoodieHub`
  }, [pathname])
}
