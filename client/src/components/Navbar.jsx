import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiMenu, FiShoppingBag, FiUser, FiX } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import brandMark from '../assets/foodiehub-mark.svg'

export default function Navbar() {
  const { cartCount, user, logout } = useApp()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const navClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`
  const closeMenu = () => setOpen(false)
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link to="/" className="brand" onClick={closeMenu}><img src={brandMark} alt="" /><span>foodie<span className="brand-accent">hub</span></span></Link>
        <button className="icon-button mobile-menu" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <FiX /> : <FiMenu />}</button>
        <nav className={`main-nav${open ? ' nav-open' : ''}`}>
          <NavLink to="/" end className={navClass} onClick={closeMenu}>Home</NavLink>
          <NavLink to="/restaurants" className={navClass} onClick={closeMenu}>Explore</NavLink>
          {user && <NavLink to="/orders" className={navClass} onClick={closeMenu}>My orders</NavLink>}
          {user && <NavLink to="/profile" className={navClass} onClick={closeMenu}>Profile</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" className={navClass} onClick={closeMenu}>Dashboard</NavLink>}
          <div className="mobile-nav-actions">
            {user ? <button className="nav-link" onClick={() => { logout(); closeMenu(); navigate('/') }}>Sign out</button> : <Link className="nav-link" to="/login" onClick={closeMenu}>Sign in</Link>}
            <Link to="/cart" className="button button-dark nav-bag" onClick={closeMenu}><FiShoppingBag /> Bag <span className="cart-count">{cartCount}</span><FiArrowRight /></Link>
          </div>
        </nav>
        <div className="nav-actions">
          {user ? <Link to="/profile" className="avatar-link" aria-label="Your profile"><FiUser /><span>{user.name?.split(' ')[0]}</span></Link> : <Link className="nav-signin" to="/login">Sign in</Link>}
          <Link to="/cart" className="button button-dark nav-bag"><FiShoppingBag /> Bag <span className="cart-count">{cartCount}</span><FiArrowRight /></Link>
        </div>
      </div>
    </header>
  )
}
