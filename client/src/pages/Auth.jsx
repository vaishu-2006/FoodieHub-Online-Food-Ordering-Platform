import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import api from '../services/api'
import { errorMessage } from '../utils/format'
import SafeImage from '../components/SafeImage'

export default function Auth({ register = false }) {
  const { user, setUser, notify } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post(`/auth/${register ? 'register' : 'login'}`, form)
      localStorage.setItem('foodiehub-token', data.token)
      setUser(data.user)
      notify(register ? 'Your account is ready. Let’s find your next favorite.' : `Welcome back, ${data.user.name.split(' ')[0]}!`)
      const destination = location.state?.from?.pathname || (data.user.role === 'admin' ? '/admin' : '/')
      navigate(destination, { replace: true })
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }
  return <section className="auth-page"><div className="auth-art"><SafeImage src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=85" alt="A table filled with a delicious meal" /><div className="auth-art-caption"><span className="eyebrow">GOOD FOOD, GOOD COMPANY</span><h2>Make room<br />for something <em>lovely.</em></h2></div></div><div className="auth-panel"><div className="auth-form-wrap"><span className="eyebrow">{register ? 'YOUR TABLE IS WAITING' : 'PICK UP WHERE YOU LEFT OFF'}</span><h1>{register ? 'Let’s get to know you.' : 'Good to see you again.'}</h1><p>{register ? 'A few details and you’re one step closer to your next favorite meal.' : 'Sign in for the good stuff: your orders, saved addresses, and more.'}</p><form onSubmit={submit} className="form-stack">{register && <label>Your name<input name="name" value={form.name} onChange={update} placeholder="What should we call you?" required minLength="2" autoComplete="name" /></label>}<label>Email address<input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" required autoComplete="email" /></label>{register && <label>Phone number<input name="phone" type="tel" value={form.phone} onChange={update} placeholder="+91 98765 43210" required minLength="8" autoComplete="tel" /></label>}<label>Password<div className="password-input"><input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={update} placeholder={register ? 'At least 8 characters' : 'Your password'} required minLength={register ? 8 : 1} autoComplete={register ? 'new-password' : 'current-password'} /><button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FiEyeOff /> : <FiEye />}</button></div></label>{error && <div className="form-error">{error}</div>}<button className="button button-orange auth-submit" disabled={loading}>{loading ? 'One moment…' : register ? 'Create my account' : 'Sign in'} <FiArrowRight /></button></form><div className="auth-switch">{register ? 'Already have a FoodieHub account?' : 'New around here?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create an account'}</Link></div><div className="auth-privacy">Your details stay yours. We’ll only use them to get your good food to you.</div></div></div></section>
}
