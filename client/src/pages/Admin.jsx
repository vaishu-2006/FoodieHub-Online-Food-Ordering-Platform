import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiArrowDownRight, FiArrowUpRight, FiCheck, FiEdit2, FiPlus, FiShoppingBag, FiStar, FiTrash2, FiUsers, FiX } from 'react-icons/fi'
import api from '../services/api'
import Loading from '../components/Loading'
import SafeImage from '../components/SafeImage'
import { errorMessage, money, imageUrl } from '../utils/format'

const emptyRestaurant = { name: '', description: '', image: '', cuisine: '', rating: '4.7', deliveryTime: '25–35 min', address: '', isActive: true }
const emptyFood = { name: '', description: '', price: '', image: '', category: '', restaurantId: '', isAvailable: true, foodType: 'veg' }
const tabs = ['Overview', 'Orders', 'Restaurants', 'Menu', 'Customers']
const statusNames = { placed: 'Placed', confirmed: 'Confirmed', preparing: 'Preparing', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled' }
const statusChoices = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [dashboard, setDashboard] = useState(null)
  const [orders, setOrders] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [foods, setFoods] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyRestaurant)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const loadData = useCallback(async () => {
    setError('')
    try {
      const [dashboardResult, ordersResult, inventoryResult, customersResult] = await Promise.all([
        api.get('/admin/dashboard'), api.get('/orders'), api.get('/admin/inventory'), api.get('/admin/customers'),
      ])
      setDashboard(dashboardResult.data)
      setOrders(ordersResult.data.orders)
      setRestaurants(inventoryResult.data.restaurants)
      setFoods(inventoryResult.data.foods)
      setCustomers(customersResult.data.customers)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => { loadData() }, [loadData])

  const showCreate = (kind) => {
    setModal({ kind, item: null })
    setForm(kind === 'restaurant' ? emptyRestaurant : { ...emptyFood, restaurantId: restaurants[0]?._id || '' })
    setSaveError('')
  }
  const showEdit = (kind, item) => {
    setModal({ kind, item })
    setForm(kind === 'restaurant'
      ? { ...item, cuisine: item.cuisine.join(', ') }
      : { ...item, restaurantId: item.restaurantId?._id || item.restaurantId || '' })
    setSaveError('')
  }
  const saveItem = async (event) => {
    event.preventDefault()
    setSaving(true)
    setSaveError('')
    try {
      const kind = modal.kind
      const payload = kind === 'restaurant'
        ? { ...form, rating: Number(form.rating), cuisine: form.cuisine.split(',').map((item) => item.trim()).filter(Boolean) }
        : { ...form, price: Number(form.price) }
      const base = kind === 'restaurant' ? '/restaurants' : '/foods'
      if (modal.item) await api.put(`${base}/${modal.item._id}`, payload)
      else await api.post(base, payload)
      setModal(null)
      await loadData()
    } catch (requestError) {
      setSaveError(errorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }
  const deleteItem = async (kind, item) => {
    if (!window.confirm(`Delete “${item.name}”? This action cannot be undone.`)) return
    try {
      await api.delete(`/${kind === 'restaurant' ? 'restaurants' : 'foods'}/${item._id}`)
      await loadData()
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }
  const updateAvailability = async (food) => {
    try {
      await api.patch(`/foods/${food._id}/availability`, { isAvailable: !food.isAvailable })
      await loadData()
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }
  const updateStatus = async (order, orderStatus) => {
    try {
      await api.put(`/orders/${order._id}/status`, { orderStatus })
      await loadData()
    } catch (requestError) {
      setError(errorMessage(requestError))
    }
  }
  const chartDays = useMemo(() => {
    const values = new Map((dashboard?.daily || []).map((day) => [day._id, day]))
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - index))
      const key = date.toLocaleDateString('en-CA')
      return { label: date.toLocaleDateString('en-IN', { weekday: 'short' }), ...values.get(key), revenue: values.get(key)?.revenue || 0 }
    })
  }, [dashboard])
  const maxRevenue = Math.max(...chartDays.map((day) => day.revenue), 1)

  if (loading) return <Loading label="Opening your dashboard…" />
  return <section className="container admin-page">
    <div className="admin-welcome"><div><span className="eyebrow">YOUR LITTLE CORNER OF CONTROL</span><h1>Good morning, <em>boss.</em></h1><p>Here’s the good stuff happening across FoodieHub.</p></div><button className="button button-dark" onClick={() => showCreate(activeTab === 'Restaurants' ? 'restaurant' : 'food')}><FiPlus /> Add {activeTab === 'Restaurants' ? 'restaurant' : 'menu item'}</button></div>
    <div className="admin-tabs">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? 'selected' : ''}>{tab}</button>)}</div>
    {error && <div className="admin-error"><span>{error}</span><button onClick={loadData}>Try again</button></div>}
    {activeTab === 'Overview' && <div className="admin-content"><div className="stat-grid"><article className="stat-card"><span className="stat-icon orange"><FiShoppingBag /></span><span className="eyebrow">TOTAL ORDERS</span><strong>{dashboard?.stats.totalOrders || 0}</strong><small>Since the very beginning</small></article><article className="stat-card"><span className="stat-icon green"><FiArrowUpRight /></span><span className="eyebrow">TOTAL REVENUE</span><strong>{money(dashboard?.stats.totalRevenue || 0)}</strong><small>From non-cancelled orders</small></article><article className="stat-card"><span className="stat-icon blue"><FiUsers /></span><span className="eyebrow">FOOD LOVERS</span><strong>{dashboard?.stats.totalCustomers || 0}</strong><small>Lovely customers and counting</small></article><article className="stat-card"><span className="stat-icon pink"><FiStar /></span><span className="eyebrow">RESTAURANTS</span><strong>{dashboard?.stats.totalRestaurants || 0}</strong><small>Local kitchens on FoodieHub</small></article></div><div className="admin-overview-grid"><article className="admin-panel chart-panel"><div className="panel-heading"><div><span className="eyebrow">THE LAST SEVEN DAYS</span><h2>Sales at a glance</h2></div><span className="chart-period"><FiArrowDownRight /> Daily revenue</span></div><div className="chart">{chartDays.map((day, index) => <div className="chart-bar-group" key={day.label + index}><div className="chart-value">{day.revenue ? money(day.revenue) : ''}</div><div className="chart-track"><div className="chart-bar" style={{ height: `${Math.max(4, day.revenue / maxRevenue * 100)}%` }} /></div><small>{day.label}</small></div>)}</div></article><article className="admin-panel quick-panel"><span className="eyebrow">A LITTLE QUICK LOOK</span><h2>Recent orders</h2>{dashboard?.recentOrders?.length ? dashboard.recentOrders.map((order) => <div className="quick-order" key={order._id}><span className="quick-order-icon"><FiShoppingBag /></span><div><strong>{order.userId?.name || 'Customer'}</strong><small>{order.restaurantId?.name || 'Restaurant'} · {statusNames[order.orderStatus]}</small></div><b>{money(order.totalAmount)}</b></div>) : <div className="admin-empty">Your first order will show up here.</div>}<button className="text-link" onClick={() => setActiveTab('Orders')}>All orders <FiArrowUpRight /></button></article></div></div>}
    {activeTab === 'Orders' && <div className="admin-content"><div className="admin-section-heading"><div><span className="eyebrow">EVERY MEAL, EVERY DETAIL</span><h2>All orders <span>{orders.length}</span></h2></div><p>Keep the good food moving.</p></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>KITCHEN</th><th>PLACED</th><th>TOTAL</th><th>STATUS</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id}><td><strong>#{order._id.slice(-7).toUpperCase()}</strong><small>{order.items.length} menu items</small></td><td><strong>{order.userId?.name || '—'}</strong><small>{order.userId?.email}</small></td><td>{order.restaurantId?.name || '—'}</td><td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td><td><strong>{money(order.totalAmount)}</strong></td><td>{statusChoices[order.orderStatus]?.length ? <select className="status-select" value={order.orderStatus} onChange={(e) => updateStatus(order, e.target.value)}><option value={order.orderStatus}>{statusNames[order.orderStatus]}</option>{statusChoices[order.orderStatus].map((status) => <option value={status} key={status}>{statusNames[status]}</option>)}</select> : <span className={`status-chip status-${order.orderStatus}`}>{statusNames[order.orderStatus]}</span>}</td></tr>)}</tbody></table>{!orders.length && <div className="admin-empty">No orders yet. They’ll appear here as soon as the good food starts moving.</div>}</div></div>}
    {activeTab === 'Restaurants' && <div className="admin-content"><div className="admin-section-heading"><div><span className="eyebrow">THE LOCAL LINEUP</span><h2>Your restaurants <span>{restaurants.length}</span></h2></div><button className="button button-orange" onClick={() => showCreate('restaurant')}><FiPlus /> Add restaurant</button></div><div className="admin-inventory-grid">{restaurants.map((restaurant) => <article className="inventory-card" key={restaurant._id}><SafeImage src={imageUrl(restaurant.image)} alt="" /><div className="inventory-card-info"><span className={`availability ${restaurant.isActive ? 'is-available' : ''}`}>{restaurant.isActive ? 'ACTIVE' : 'PAUSED'}</span><h3>{restaurant.name}</h3><p>{restaurant.cuisine.join(' · ')}</p><small><FiStar /> {restaurant.rating} &nbsp;·&nbsp; {restaurant.deliveryTime}</small><div className="inventory-actions"><button onClick={() => showEdit('restaurant', restaurant)}><FiEdit2 /> Edit</button><button className="danger-action" onClick={() => deleteItem('restaurant', restaurant)}><FiTrash2 /> Delete</button></div></div></article>)}</div>{!restaurants.length && <div className="admin-empty">Add your first restaurant to get started.</div>}</div>}
    {activeTab === 'Menu' && <div className="admin-content"><div className="admin-section-heading"><div><span className="eyebrow">MADE FRESH, LISTED HERE</span><h2>Menu items <span>{foods.length}</span></h2></div><button className="button button-orange" onClick={() => showCreate('food')}><FiPlus /> Add menu item</button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ITEM</th><th>RESTAURANT</th><th>CATEGORY</th><th>PRICE</th><th>AVAILABILITY</th><th>ACTIONS</th></tr></thead><tbody>{foods.map((food) => <tr key={food._id}><td><div className="admin-food-cell"><SafeImage src={imageUrl(food.image)} alt="" /><span><strong>{food.name}</strong><small>{food.foodType === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}</small></span></div></td><td>{food.restaurantId?.name || '—'}</td><td>{food.category}</td><td><strong>{money(food.price)}</strong></td><td><button className={`availability-toggle ${food.isAvailable ? 'is-available' : ''}`} onClick={() => updateAvailability(food)}>{food.isAvailable ? 'Available' : 'Unavailable'}</button></td><td><div className="table-actions"><button aria-label={`Edit ${food.name}`} onClick={() => showEdit('food', food)}><FiEdit2 /></button><button aria-label={`Delete ${food.name}`} className="danger-action" onClick={() => deleteItem('food', food)}><FiTrash2 /></button></div></td></tr>)}</tbody></table>{!foods.length && <div className="admin-empty">Add your first menu item to get started.</div>}</div></div>}
    {activeTab === 'Customers' && <div className="admin-content"><div className="admin-section-heading"><div><span className="eyebrow">THE PEOPLE BEHIND THE GOOD MOOD</span><h2>Your customers <span>{customers.length}</span></h2></div><p>Just the details you need to serve them well.</p></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>CUSTOMER</th><th>EMAIL</th><th>PHONE</th><th>JOINED</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer._id}><td><strong>{customer.name}</strong></td><td>{customer.email}</td><td>{customer.phone}</td><td>{new Date(customer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td></tr>)}</tbody></table>{!customers.length && <div className="admin-empty">Your first customer will appear here.</div>}</div></div>}
    {modal && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(null) }}><div className="admin-modal"><div className="modal-heading"><div><span className="eyebrow">{modal.item ? 'A FEW LITTLE UPDATES' : 'LET’S ADD SOMETHING LOVELY'}</span><h2>{modal.item ? 'Edit' : 'Add'} {modal.kind === 'restaurant' ? 'a restaurant' : 'a menu item'}</h2></div><button className="icon-button" aria-label="Close dialog" onClick={() => setModal(null)}><FiX /></button></div><form className="admin-form" onSubmit={saveItem}>{modal.kind === 'restaurant' ? <><label>Restaurant name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Short description<textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><label>Image URL<input type="url" required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></label><label>Cuisines <small>Separate with commas</small><input required value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })} placeholder="Italian, Pizza" /></label><div className="form-grid"><label>Rating<input type="number" step="0.1" min="0" max="5" required value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} /></label><label>Delivery estimate<input required value={form.deliveryTime} onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })} /></label></div><label>Address<input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label><label className="checkbox-label"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Accepting orders</label></> : <><label>Food name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Description<textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><div className="form-grid"><label>Price (₹)<input type="number" min="1" step="1" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label><label>Category<input required list="food-categories" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Pizza, Desserts…" /><datalist id="food-categories">{[...new Set(foods.map((food) => food.category))].map((category) => <option key={category} value={category} />)}</datalist></label></div><label>Restaurant<select required value={form.restaurantId} onChange={(e) => setForm({ ...form, restaurantId: e.target.value })}><option value="">Choose a kitchen</option>{restaurants.filter((restaurant) => restaurant.isActive).map((restaurant) => <option key={restaurant._id} value={restaurant._id}>{restaurant.name}</option>)}</select></label><label>Image URL<input type="url" required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></label><div className="form-grid"><label>Food type<select value={form.foodType} onChange={(e) => setForm({ ...form, foodType: e.target.value })}><option value="veg">Vegetarian</option><option value="non-veg">Non-vegetarian</option></select></label><label className="checkbox-label"><input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} /> Available to order</label></div></>}{saveError && <div className="form-error">{saveError}</div>}<div className="modal-actions"><button type="button" className="button button-light" onClick={() => setModal(null)}>Cancel</button><button className="button button-orange" disabled={saving}>{saving ? 'Saving…' : modal.item ? 'Save changes' : 'Add to FoodieHub'} <FiCheck /></button></div></form></div></div>}
  </section>
}
