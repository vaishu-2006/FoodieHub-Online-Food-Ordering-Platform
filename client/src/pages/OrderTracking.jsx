import { Link, useLocation, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FiArrowLeft, FiCheck, FiClock, FiMapPin, FiPackage } from 'react-icons/fi'
import api from '../services/api'
import Loading from '../components/Loading'
import { errorMessage, money } from '../utils/format'

const stages = [
  { id: 'placed', label: 'Order placed', note: 'Your order is in the queue', icon: FiCheck },
  { id: 'confirmed', label: 'Confirmed', note: 'The kitchen has your order', icon: FiCheck },
  { id: 'preparing', label: 'Preparing', note: 'Made fresh, just for you', icon: FiPackage },
  { id: 'out_for_delivery', label: 'Out for delivery', note: 'A little joy is on the way', icon: FiMapPin },
  { id: 'delivered', label: 'Delivered', note: 'Enjoy every bite!', icon: FiCheck },
]
const statusIndex = { placed: 0, confirmed: 1, preparing: 2, out_for_delivery: 3, delivered: 4, cancelled: -1 }

export default function OrderTracking() {
  const { id } = useParams()
  const location = useLocation()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    const fetchOrder = () => api.get(`/orders/${id}`).then(({ data }) => { if (active) { setOrder(data.order); setError('') } }).catch((err) => { if (active) setError(errorMessage(err)) })
    fetchOrder()
    const timer = window.setInterval(fetchOrder, 15000)
    return () => { active = false; window.clearInterval(timer) }
  }, [id])
  if (error && !order) return <div className="container empty-state"><h2>We couldn’t find that order.</h2><p>{error}</p><Link className="button button-dark" to="/orders">Back to your orders</Link></div>
  if (!order) return <Loading label="Tracking your order…" />
  const currentIndex = statusIndex[order.orderStatus] ?? 0
  return <section className="container tracking-page"><Link to="/orders" className="back-link"><FiArrowLeft /> All your orders</Link><div className="tracking-header"><div><span className="eyebrow">{location.state?.justPlaced ? 'A GOOD CHOICE, INDEED' : 'WE’RE ON IT'}</span><h1>{order.orderStatus === 'delivered' ? 'Happiness, delivered.' : order.orderStatus === 'cancelled' ? 'This order was cancelled.' : 'Your good food is on its way.'}</h1><p>{order.orderStatus === 'delivered' ? 'We hope every bite was as lovely as you are.' : `Order #${order._id.slice(-7).toUpperCase()} · Placed ${new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`}</p></div><div className="eta-card"><span className="eta-icon">✦</span><span className="eyebrow">ESTIMATED DELIVERY</span><strong>{order.orderStatus === 'delivered' ? 'Delivered!' : order.orderStatus === 'cancelled' ? 'Cancelled' : order.restaurantId?.deliveryTime || '25–35 min'}</strong><small>Fresh is worth the wait</small></div></div>{order.orderStatus === 'cancelled' ? <div className="tracking-cancelled">This order has been cancelled. If you have questions, please contact <a href="mailto:hello@foodiehub.example">our support team</a>.</div> : <div className="tracking-timeline">{stages.map((stage, index) => { const Icon = stage.icon; const complete = index <= currentIndex; const active = index === currentIndex; return <div className={`timeline-step${complete ? ' complete' : ''}${active ? ' current' : ''}`} key={stage.id}><div className="timeline-icon"><Icon /></div><div><strong>{stage.label}</strong><small>{stage.note}</small></div>{complete && <span className="timeline-check"><FiCheck /></span>}</div> })}</div>}<div className="tracking-bottom"><div className="tracking-order-detail"><div className="checkout-card-heading"><span className="step-number"><FiPackage /></span><div><h2>From the kitchen of</h2><p>{order.restaurantId?.name || 'FoodieHub kitchen'}</p></div></div><div className="tracking-items">{order.items.map((item, index) => <div className="summary-row" key={`${item.name}-${index}`}><span>{item.quantity} × {item.name}</span><strong>{money(item.price * item.quantity)}</strong></div>)}</div><div className="summary-total"><span>Total paid · {order.paymentMethod === 'cash_on_delivery' ? 'Pay on arrival' : order.paymentStatus}</span><strong>{money(order.totalAmount)}</strong></div></div><div className="delivery-address"><span className="eyebrow"><FiMapPin /> DELIVERING TO</span><strong>{order.deliveryAddress.name} · {order.deliveryAddress.label}</strong><p>{order.deliveryAddress.line1}, {order.deliveryAddress.city} {order.deliveryAddress.postalCode}</p><p>{order.deliveryAddress.phone}</p></div></div></section>
}
