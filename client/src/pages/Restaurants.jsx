import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiSearch, FiSliders } from 'react-icons/fi'
import RestaurantCard from '../components/RestaurantCard'
import Loading from '../components/Loading'
import api from '../services/api'
import { errorMessage } from '../utils/format'

export default function Restaurants() {
  const [params, setParams] = useSearchParams()
  const [restaurants, setRestaurants] = useState([])
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState(params.get('q') || '')
  const [cuisine, setCuisine] = useState(params.get('category') || '')
  const [rating, setRating] = useState('')
  const [priceRange, setPriceRange] = useState('')
  useEffect(() => {
    Promise.all([api.get('/restaurants'), api.get('/foods?available=true')])
      .then(([restaurantResponse, foodResponse]) => {
        setRestaurants(restaurantResponse.data.restaurants)
        setFoods(foodResponse.data.foods)
      })
      .catch((err) => setError(errorMessage(err))).finally(() => setLoading(false))
  }, [])
  const cuisines = [...new Set([...restaurants.flatMap((restaurant) => restaurant.cuisine || []), ...foods.map((food) => food.category)])]
  const filtered = restaurants.filter((restaurant) => {
    const menuItems = foods.filter((food) => food.restaurantId?._id === restaurant._id)
    const menuText = menuItems.map((food) => `${food.name} ${food.category}`).join(' ')
    const text = `${restaurant.name} ${restaurant.description} ${(restaurant.cuisine || []).join(' ')} ${menuText}`.toLowerCase()
    const averagePrice = menuItems.length ? menuItems.reduce((sum, food) => sum + food.price, 0) / menuItems.length : 0
    const matchesPrice = !priceRange
      || (priceRange === 'under-250' && averagePrice < 250)
      || (priceRange === '250-350' && averagePrice >= 250 && averagePrice < 350)
      || (priceRange === '350-plus' && averagePrice >= 350)
    const matchesCuisineOrCategory = !cuisine
      || restaurant.cuisine?.some((item) => item.toLowerCase() === cuisine.toLowerCase())
      || menuItems.some((food) => food.category.toLowerCase() === cuisine.toLowerCase())
    return (!query || text.includes(query.toLowerCase()))
      && matchesCuisineOrCategory
      && (!rating || Number(restaurant.rating) >= Number(rating))
      && matchesPrice
  })
  return <section className="listing-page"><div className="listing-hero"><div className="container"><span className="eyebrow">A TABLE FULL OF POSSIBILITIES</span><h1>Find something <em>delicious.</em></h1><p>Local kitchens, lovely people, and the dishes you didn't know you were craving.</p></div></div><div className="container listing-content"><div className="listing-toolbar"><label className="listing-search"><FiSearch /><input value={query} onChange={(e) => { setQuery(e.target.value); setParams((p) => { if (e.target.value) p.set('q', e.target.value); else p.delete('q'); return p }, { replace: true }) }} placeholder="Search restaurants or cuisine…" /></label><label className="filter-select"><FiSliders /><select value={cuisine} onChange={(e) => { setCuisine(e.target.value); setParams((p) => { if (e.target.value) p.set('category', e.target.value); else p.delete('category'); return p }, { replace: true }) }}><option value="">All cuisines & categories</option>{cuisines.map((item) => <option key={item}>{item}</option>)}</select></label><label className="filter-select"><FiSliders /><select value={rating} onChange={(e) => setRating(e.target.value)}><option value="">Any rating</option><option value="4.5">4.5+ stars</option><option value="4">4+ stars</option></select></label><label className="filter-select"><FiSliders /><select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}><option value="">Any price</option><option value="under-250">Under ₹250 avg</option><option value="250-350">₹250–350 avg</option><option value="350-plus">₹350+ avg</option></select></label></div><div className="listing-result-line"><span>{filtered.length} lovely {filtered.length === 1 ? 'kitchen' : 'kitchens'} to explore</span><span>Fresh picks, updated daily</span></div>{loading ? <Loading label="Setting the table…" /> : error ? <div className="empty-state"><h2>We couldn’t load the menu.</h2><p>{error}</p></div> : filtered.length ? <div className="restaurant-grid listing-grid">{filtered.map((restaurant) => <RestaurantCard key={restaurant._id} restaurant={restaurant} />)}</div> : <div className="empty-state"><span>🥣</span><h2>No kitchens found just yet.</h2><p>Try a different search or clear your filters.</p><button className="button button-dark" onClick={() => { setQuery(''); setCuisine(''); setRating(''); setPriceRange(''); setParams({}) }}>Clear filters</button></div>}</div></section>
}
