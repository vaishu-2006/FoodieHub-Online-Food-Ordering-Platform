import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowDownRight, FiArrowRight, FiArrowUpRight, FiSearch, FiStar } from 'react-icons/fi'
import RestaurantCard from '../components/RestaurantCard'
import FoodCard from '../components/FoodCard'
import SafeImage from '../components/SafeImage'
import Loading from '../components/Loading'
import api from '../services/api'
import { errorMessage } from '../utils/format'

const categories = [
  { name: 'Pizza', icon: '🍕', color: 'peach' }, { name: 'Burgers', icon: '🍔', color: 'yellow' },
  { name: 'Indian', icon: '🍛', color: 'mint' }, { name: 'Chinese', icon: '🥡', color: 'lavender' },
  { name: 'Desserts', icon: '🍰', color: 'pink' }, { name: 'Beverages', icon: '🧋', color: 'blue' },
]
const reviews = [
  { quote: 'I can tell everything is made with care. Sunday dinner at home just got a serious upgrade.', name: 'Ananya R.', detail: 'Customer since 2023', initials: 'AR' },
  { quote: 'The delivery is always quick, and the restaurant picks are genuinely so good.', name: 'Rohan M.', detail: 'Customer since 2024', initials: 'RM' },
  { quote: 'Found my new favorite pizza place through FoodieHub. The little things really matter!', name: 'Maya S.', detail: 'Customer since 2024', initials: 'MS' },
]

export default function Home() {
  const [restaurants, setRestaurants] = useState([])
  const [featuredFoods, setFeaturedFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  useEffect(() => {
    Promise.all([api.get('/restaurants'), api.get('/foods?available=true')])
      .then(([restaurantResponse, foodResponse]) => {
        setRestaurants(restaurantResponse.data.restaurants.slice(0, 3))
        setFeaturedFoods(foodResponse.data.foods.slice(0, 4))
      })
      .catch((err) => setError(errorMessage(err))).finally(() => setLoading(false))
  }, [])
  const search = (event) => {
    event.preventDefault()
    navigate(`/restaurants?q=${encodeURIComponent(query)}`)
  }
  return (
    <>
      <section className="hero-section"><div className="container hero-grid"><div className="hero-copy"><span className="eyebrow"><span className="eyebrow-dot" /> GOOD FOOD. GOOD MOOD.</span><h1>A little joy,<br />delivered <em>fresh.</em></h1><p>Your neighborhood favorites, made with love and brought right to your door.</p><form className="hero-search" onSubmit={search}><FiSearch /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Dishes, restaurants, cravings…" aria-label="Search dishes and restaurants" /><button className="button button-orange" type="submit">Find food <FiArrowRight /></button></form><div className="hero-proof"><div className="proof-avatars"><span>A</span><span>R</span><span>M</span></div><div><span className="proof-stars"><FiStar /><FiStar /><FiStar /><FiStar /><FiStar /></span><small>Loved by <strong>2,400+</strong> happy foodies</small></div></div></div><div className="hero-art"><div className="hero-image"><SafeImage src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1100&q=90" alt="Freshly baked pizza topped with basil" /><div className="hero-image-label"><span>✦</span> Made fresh<br />just for you</div></div><div className="floating-note"><span>🍕</span><div><strong>Good things</strong><small>are on the way</small></div></div><div className="hero-doodle">✳</div></div></div><div className="container hero-bottom"><span>MADE FRESH. DELIVERED HAPPY.</span><span>01 — YOUR NEXT FAVORITE MEAL <FiArrowDownRight /></span></div></section>
      <section className="section category-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">WHAT ARE YOU CRAVING?</span><h2>A good mood, <em>served.</em></h2></div><Link to="/restaurants" className="text-link">See all menus <FiArrowUpRight /></Link></div><div className="category-grid">{categories.map((category, i) => <Link key={category.name} to={`/restaurants?category=${category.name}`} className={`category-card category-${category.color}`} style={{ '--delay': `${i * 60}ms` }}><span className="category-emoji">{category.icon}</span><strong>{category.name}</strong><FiArrowUpRight className="category-arrow" /></Link>)}</div></div></section>
      <section className="section restaurant-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">A FEW LOCAL FAVORITES</span><h2>Good people. <em>Great food.</em></h2></div><Link to="/restaurants" className="text-link">Explore all <FiArrowUpRight /></Link></div>{loading ? <Loading label="Finding the good stuff…" /> : error ? <div className="inline-error">{error}<button onClick={() => window.location.reload()}>Try again</button></div> : <div className="restaurant-grid">{restaurants.map((restaurant) => <RestaurantCard key={restaurant._id} restaurant={restaurant} />)}</div>}</div></section>
      <section className="section trending-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">A LITTLE SOMETHING TO CRAVE</span><h2>The ones everyone <em>loves.</em></h2></div><Link to="/restaurants" className="text-link">Browse all menus <FiArrowUpRight /></Link></div>{loading ? <Loading label="Picking out the good stuff…" /> : featuredFoods.length ? <div className="trending-grid">{featuredFoods.map((food) => <div className="trending-item" key={food._id}><span className="trending-restaurant">{food.restaurantId?.name}</span><FoodCard food={food} restaurant={food.restaurantId} /></div>)}</div> : <div className="empty-state"><p>Fresh picks are on their way.</p></div>}</div></section>
      <section className="offer-section"><div className="container offer-card"><div className="offer-copy"><span className="eyebrow">A LITTLE SOMETHING ON US</span><h2>Good things<br />come to the <em>table.</em></h2><p>Take 15% off your first order. Something delicious is closer than you think.</p><Link to="/restaurants" className="button button-dark">Find your first bite <FiArrowRight /></Link><small>Use code <strong>FIRSTBITE</strong> at checkout</small></div><div className="offer-art"><SafeImage src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85" alt="Fresh colorful meal bowl" /><span className="offer-badge">15%<small>OFF</small></span><span className="offer-sparkle">✳</span></div></div></section>
      <section className="section review-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">KIND WORDS, FULL HEARTS</span><h2>Don't just take <em>our word.</em></h2></div><div className="review-summary"><span className="proof-stars"><FiStar /><FiStar /><FiStar /><FiStar /><FiStar /></span><strong>4.9 out of 5</strong><small>from our lovely customers</small></div></div><div className="review-grid">{reviews.map((review) => <article className="review-card" key={review.name}><span className="review-quote">“</span><p>{review.quote}</p><div className="review-person"><span>{review.initials}</span><div><strong>{review.name}</strong><small>{review.detail}</small></div><span className="review-stars">★★★★★</span></div></article>)}</div></div></section>
    </>
  )
}
