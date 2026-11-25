import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AppContext = createContext(null)
const readStoredCart = () => {
  try {
    return JSON.parse(localStorage.getItem('foodiehub-cart') || '[]')
  } catch {
    return []
  }
}

export function AppProvider({ children }) {
  const [cart, setCart] = useState(readStoredCart)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    localStorage.setItem('foodiehub-cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    const token = localStorage.getItem('foodiehub-token')
    if (!token) {
      setAuthLoading(false)
      return
    }
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('foodiehub-token')
        setUser(null)
      })
      .finally(() => setAuthLoading(false))
  }, [])

  const notify = useCallback((message, kind = 'success') => {
    setToast({ message, kind })
    window.setTimeout(() => setToast(null), 3200)
  }, [])

  const addToCart = useCallback((food, restaurant) => {
    if (cart.length && cart[0].restaurantId !== restaurant._id) {
      notify('Your cart can only contain items from one restaurant.', 'error')
      return
    }
    setCart((current) => {
      const existing = current.find((item) => item._id === food._id)
      return existing
        ? current.map((item) => item._id === food._id ? { ...item, quantity: Math.min(50, item.quantity + 1) } : item)
        : [...current, { ...food, quantity: 1, restaurantId: restaurant._id, restaurantName: restaurant.name }]
    })
    notify(`${food.name} added to your bag`)
  }, [cart, notify])

  const setQuantity = useCallback((foodId, quantity) => {
    setCart((current) => quantity <= 0
      ? current.filter((item) => item._id !== foodId)
      : current.map((item) => item._id === foodId ? { ...item, quantity: Math.min(50, quantity) } : item))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])
  const logout = useCallback(() => {
    localStorage.removeItem('foodiehub-token')
    setUser(null)
    notify('You have been signed out')
  }, [notify])

  const value = useMemo(() => ({
    cart, user, setUser, authLoading, toast, notify, addToCart, setQuantity, clearCart, logout,
    cartCount: cart.reduce((total, item) => total + item.quantity, 0),
    subtotal: cart.reduce((total, item) => total + item.price * item.quantity, 0),
  }), [cart, user, authLoading, toast, notify, addToCart, setQuantity, clearCart, logout])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
