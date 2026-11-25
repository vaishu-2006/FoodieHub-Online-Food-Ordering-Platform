import { Navigate, Route, Routes } from 'react-router-dom'
import SiteLayout from './layouts/SiteLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Restaurants from './pages/Restaurants'
import RestaurantDetail from './pages/RestaurantDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Auth from './pages/Auth'
import Orders from './pages/Orders'
import OrderTracking from './pages/OrderTracking'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import usePageTitle from './hooks/usePageTitle'

export default function App() {
  usePageTitle()
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="restaurants" element={<Restaurants />} />
        <Route path="restaurant/:id" element={<RestaurantDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="login" element={<Auth />} />
        <Route path="register" element={<Auth register />} />
        <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="orders/:id" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="admin" element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
