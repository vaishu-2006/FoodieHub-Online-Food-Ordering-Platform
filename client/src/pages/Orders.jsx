import { Link } from 'react-router-dom'
import { FiArrowRight, FiClock, FiPackage } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import api from '../services/api'
import Loading from '../components/Loading'
import { errorMessage, money } from '../utils/format'

const prettyStatus = (status) => status?.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { api.get('/orders/my-orders').then(({ data }) => setOrders(data.orders)).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false)) }, [])
  if (loading) return <Loading label="Finding your past orders…" />
  return <section className="container orders-page"><div className="page-kicker"><span className="eyebrow">THE GOOD TIMES, REVISITED</span><h1>Your order <em>story.</em></h1><p>Every good meal deserves a little encore.</p></div>{error ? <div className="form-error">{error}</div> : orders.length ? <div className="orders-list">{orders.map((order) => <article className="order-list-card" key={order._id}><div className="order-list-top"><div className="order-restaurant-icon"><FiPackage /></div><div className="order-list-info"><span className="eyebrow">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span><h2>{order.restaurantId?.name || 'FoodieHub kitchen'}</h2><p>{order.items.map((item) => `${item.quantity} × ${item.name}`).join(' · ')}</p></div><span className={`status-chip status-${order.orderStatus}`}>{prettyStatus(order.orderStatus)}</span></div><div className="order-list-bottom"><span><FiClock /> {order.paymentMethod === 'cash_on_delivery' ? 'Cash on delivery' : order.paymentMethod}</span><strong>{money(order.totalAmount)}</strong><Link to={`/orders/${order._id}`} className="text-link">Order details <FiArrowRight /></Link></div></article>)}</div> : <div className="empty-state"><span>🍽️</span><h2>Your story starts with a good meal.</h2><p>When you place an order, we’ll keep all the lovely details here.</p><Link className="button button-orange" to="/restaurants">Explore restaurants <FiArrowRight /></Link></div>}</section>
}
