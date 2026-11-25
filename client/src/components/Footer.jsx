import { Link } from 'react-router-dom'
import { FiArrowUpRight, FiInstagram, FiTwitter } from 'react-icons/fi'
import brandMark from '../assets/foodiehub-mark.svg'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand"><Link to="/" className="brand"><img src={brandMark} alt="" /><span>foodie<span className="brand-accent">hub</span></span></Link><p>Good food, good mood.<br />Made fresh and delivered with love.</p><div className="social-links"><a href="https://instagram.com" aria-label="Instagram"><FiInstagram /></a><a href="https://x.com" aria-label="Twitter"><FiTwitter /></a></div></div>
        <div><h4>Explore</h4><Link to="/restaurants">All restaurants</Link><Link to="/restaurants?category=Pizza">Pizza</Link><Link to="/restaurants?category=Indian">Indian food</Link></div>
        <div><h4>Help</h4><Link to="/orders">Track an order</Link><a href="mailto:hello@foodiehub.example">Contact us</a><a href="mailto:hello@foodiehub.example">FAQs</a></div>
        <div className="footer-note"><span className="eyebrow">THE GOOD STUFF, DELIVERED</span><h3>Your next favorite<br />meal is one tap away.</h3><Link to="/restaurants" className="text-link">Explore the menu <FiArrowUpRight /></Link></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} FoodieHub. Made with appetite.</span><span>Fresh picks. Happy bites.</span></div>
    </footer>
  )
}
