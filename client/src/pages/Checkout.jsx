import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiCheck, FiMapPin } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import api from '../services/api'
import { errorMessage, money } from '../utils/format'

export default function Checkout() {
  const { cart, subtotal, user, clearCart } = useApp()
  const navigate = useNavigate()
  const firstAddress = user.addresses?.[0]
  const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '', line1: firstAddress?.line1 || '', city: firstAddress?.city || '', postalCode: firstAddress?.postalCode || '', label: firstAddress?.label || 'Home' })
  const [selectedAddress, setSelectedAddress] = useState(firstAddress ? 0 : null)
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponMessage, setCouponMessage] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  if (!cart.length) return <Navigate to="/cart" replace />
  const deliveryFee = subtotal >= 500 ? 0 : 39
  const discount = coupon?.discount || 0
  const total = Math.max(0, subtotal + deliveryFee - discount)
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const applyCoupon = async () => {
    setCouponMessage('')
    setCouponLoading(true)
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode, subtotal })
      setCoupon(data)
      setCouponMessage(`${data.code} applied — you saved ${money(data.discount)}!`)
    } catch (requestError) {
      setCoupon(null)
      setCouponMessage(errorMessage(requestError))
    } finally {
      setCouponLoading(false)
    }
  }
  const placeOrder = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/orders', {
        restaurantId: cart[0].restaurantId,
        items: cart.map((item) => ({ foodId: item._id, quantity: item.quantity })),
        deliveryAddress: { label: form.label, line1: form.line1, city: form.city, postalCode: form.postalCode, phone: form.phone, name: form.name },
        paymentMethod: 'cash_on_delivery',
        couponCode: coupon?.code,
      })
      clearCart()
      navigate(`/orders/${data.order._id}`, { state: { justPlaced: true } })
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }
  return <section className="container checkout-page"><div className="page-kicker"><span className="eyebrow">ALMOST AT YOUR DOOR</span><h1>The final, <em>lovely details.</em></h1></div><Link to="/cart" className="back-link"><FiArrowLeft /> Back to your bag</Link><form className="checkout-layout" onSubmit={placeOrder}><div className="checkout-main"><section className="checkout-card"><div className="checkout-card-heading"><span className="step-number">01</span><div><h2>Where should we bring it?</h2><p>We’ll get your meal right to your door.</p></div></div>{user.addresses?.length > 0 && <div className="saved-address-picker"><span className="eyebrow">YOUR SAVED SPOTS</span><div>{user.addresses.map((address, index) => <button type="button" key={`${address.line1}-${index}`} className={selectedAddress === index ? 'selected' : ''} onClick={() => { setSelectedAddress(index); setForm({ name: user.name, phone: address.phone || user.phone, line1: address.line1, city: address.city, postalCode: address.postalCode, label: address.label || 'Home' }) }}><strong>{address.label}</strong><small>{address.line1}, {address.city}</small></button>)}<button type="button" className={selectedAddress === null ? 'selected' : ''} onClick={() => { setSelectedAddress(null); setForm({ name: user.name || '', phone: user.phone || '', line1: '', city: '', postalCode: '', label: 'Home' }) }}><strong>+ New address</strong><small>Send this one somewhere new</small></button></div></div>}<div className="form-grid"><label>Name<input name="name" value={form.name} onChange={(e) => { setSelectedAddress(null); update(e) }} required minLength="2" /></label><label>Phone number<input name="phone" type="tel" value={form.phone} onChange={(e) => { setSelectedAddress(null); update(e) }} required minLength="8" /></label><label className="full-field">Street address<input name="line1" value={form.line1} onChange={(e) => { setSelectedAddress(null); update(e) }} placeholder="Flat, building, street" required minLength="5" /></label><label>City<input name="city" value={form.city} onChange={(e) => { setSelectedAddress(null); update(e) }} required /></label><label>PIN code<input name="postalCode" value={form.postalCode} onChange={(e) => { setSelectedAddress(null); update(e) }} required minLength="4" /></label><label>Address label<select name="label" value={form.label} onChange={(e) => { setSelectedAddress(null); update(e) }}><option>Home</option><option>Work</option><option>Other</option></select></label></div></section><section className="checkout-card"><div className="checkout-card-heading"><span className="step-number">02</span><div><h2>How would you like to pay?</h2><p>Simple, safe, and no surprises.</p></div></div><label className="payment-option"><input type="radio" name="payment" checked readOnly /><span className="payment-radio" /><span className="payment-icon">💵</span><span><strong>Cash on delivery</strong><small>Pay when your order arrives</small></span><FiCheck className="payment-check" /></label><p className="payment-info">Online payments aren’t enabled until a payment provider is configured. Cash on delivery is ready to go.</p></section></div><aside className="order-summary checkout-summary"><span className="eyebrow">THE GOOD STUFF</span><h2>Your order</h2><div className="checkout-restaurant"><FiMapPin /><span>{cart[0].restaurantName}</span></div><div className="checkout-items">{cart.map((item) => <div className="summary-row" key={item._id}><span>{item.quantity} × {item.name}</span><strong>{money(item.price * item.quantity)}</strong></div>)}</div><div className="coupon-entry"><label htmlFor="coupon">Have a little something?</label><div><input id="coupon" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter a promo code" /><button type="button" onClick={applyCoupon} disabled={!couponCode || couponLoading || Boolean(coupon)}>{couponLoading ? '…' : coupon ? 'Added' : 'Apply'}</button></div>{couponMessage && <small className={coupon ? 'coupon-success' : 'coupon-error'}>{couponMessage}</small>}</div><div className="summary-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div className="summary-row"><span>Delivery</span><strong>{deliveryFee ? money(deliveryFee) : 'On us'}</strong></div>{discount > 0 && <div className="summary-row discount-row"><span>Discount</span><strong>−{money(discount)}</strong></div>}<div className="summary-total"><span>Total to pay</span><strong>{money(total)}</strong></div>{error && <div className="form-error">{error}</div>}<button className="button button-orange checkout-cta" disabled={loading}>{loading ? 'Placing your order…' : 'Place my order'} <FiArrowRight /></button><small className="secure-note">✦ &nbsp;Freshly made, always.</small></aside></form></section>
}
