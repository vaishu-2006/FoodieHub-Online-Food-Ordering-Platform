import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiLogOut, FiPlus, FiSave, FiTrash2, FiUser } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import api from '../services/api'
import { errorMessage } from '../utils/format'

export default function Profile() {
  const { user, setUser, logout, notify } = useApp()
  const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '' })
  const [addresses, setAddresses] = useState(user.addresses || [])
  const [addressForm, setAddressForm] = useState({ label: 'Home', line1: '', city: '', postalCode: '', phone: user.phone || '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.put('/auth/profile', form)
      setUser(data.user)
      notify('Your details have been saved.')
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }
  const saveAddresses = async (nextAddresses) => {
    setError('')
    try {
      const { data } = await api.put('/auth/profile', { addresses: nextAddresses })
      setAddresses(data.user.addresses)
      setUser(data.user)
      notify('Your saved addresses have been updated.')
      return true
    } catch (requestError) {
      setError(errorMessage(requestError))
      return false
    }
  }
  const addAddress = async (event) => {
    event.preventDefault()
    if (addresses.length >= 10) return
    if (await saveAddresses([...addresses, addressForm])) {
      setAddressForm({ label: 'Home', line1: '', city: '', postalCode: '', phone: user.phone || '' })
    }
  }
  return <section className="container profile-page"><div className="page-kicker"><span className="eyebrow">A LITTLE ABOUT YOU</span><h1>Your corner <em>of FoodieHub.</em></h1></div><div className="profile-layout"><aside className="profile-sidebar"><div className="profile-avatar"><FiUser /></div><h2>{user.name}</h2><p>{user.email}</p><span className="profile-member">FoodieHub member</span><Link to="/orders" className="profile-side-link">My order story <FiArrowRight /></Link><button className="profile-side-link logout-link" onClick={() => { logout(); navigate('/') }}>Sign out <FiLogOut /></button></aside><div className="profile-content"><div className="profile-content-heading"><span className="eyebrow">YOUR DETAILS</span><h2>Let’s keep things current.</h2><p>We use this to make sure your good food finds its way to you.</p></div><form onSubmit={submit} className="form-stack profile-form"><label>Full name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength="2" /></label><label>Email address<input value={user.email} disabled /></label><label>Phone number<input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required minLength="8" /></label>{error && <div className="form-error">{error}</div>}<button className="button button-orange" disabled={loading}>{loading ? 'Saving…' : 'Save my details'} <FiSave /></button></form><div className="saved-addresses"><span className="eyebrow">DELIVERY ADDRESSES</span><h3>Your saved spots</h3>{addresses.length ? addresses.map((address, index) => <div className="saved-address" key={`${address.line1}-${index}`}><div><strong>{address.label}</strong><button className="remove-address" type="button" aria-label={`Remove ${address.label} address`} onClick={() => saveAddresses(addresses.filter((_, addressIndex) => addressIndex !== index))}><FiTrash2 /></button></div><span>{address.line1}, {address.city} {address.postalCode}</span><small>{address.phone}</small></div>) : <div className="address-empty"><p>Your saved addresses will be ready at checkout.</p></div>}{addresses.length < 10 && <form className="address-form" onSubmit={addAddress}><span className="eyebrow">ADD A NEW SPOT</span><div className="form-grid"><label>Label<select value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}><option>Home</option><option>Work</option><option>Other</option></select></label><label>Phone<input type="tel" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} required minLength="8" /></label><label className="full-field">Street address<input value={addressForm.line1} onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })} required minLength="5" /></label><label>City<input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} required /></label><label>PIN code<input value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} required minLength="4" /></label></div><button className="button button-light"><FiPlus /> Save address</button></form>}</div></div></div></section>
}
