import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiClock, FiMapPin, FiStar } from 'react-icons/fi'
import FoodCard from '../components/FoodCard'
import Loading from '../components/Loading'
import SafeImage from '../components/SafeImage'
import api from '../services/api'
import { errorMessage, imageUrl } from '../utils/format'

export default function RestaurantDetail() {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    Promise.all([api.get(`/restaurants/${id}`), api.get(`/foods?restaurantId=${id}`)])
      .then(([restaurantResponse, foodResponse]) => { setRestaurant(restaurantResponse.data.restaurant); setFoods(foodResponse.data.foods) })
      .catch((err) => setError(errorMessage(err))).finally(() => setLoading(false))
  }, [id])
  if (loading) return <Loading label="Opening the kitchen…" />
  if (error || !restaurant) return <div className="container empty-state"><h2>We couldn't find that kitchen.</h2><p>{error || 'This restaurant may no longer be available.'}</p><Link to="/restaurants" className="button button-dark">Back to restaurants</Link></div>
  const sections = [...new Set(foods.map((food) => food.category))]
  return <div className="restaurant-detail-page"><div className="container detail-back"><Link to="/restaurants"><FiArrowLeft /> All restaurants</Link></div><div className="container detail-layout"><div className="detail-main"><div className="detail-cover"><SafeImage src={imageUrl(restaurant.image)} alt={restaurant.name} /><div className="detail-cover-shade" /></div><div className="detail-title"><div><span className="eyebrow">{restaurant.cuisine?.join(' · ') || 'LOCAL FAVORITES'}</span><h1>{restaurant.name}</h1><p>{restaurant.description}</p></div><div className="detail-meta"><span><FiStar /> {Number(restaurant.rating || 4.7).toFixed(1)}</span><span><FiClock /> {restaurant.deliveryTime}</span><span><FiMapPin /> {restaurant.address || 'Nearby'}</span></div></div><div className="menu-heading"><div><span className="eyebrow">MADE FRESH FOR YOU</span><h2>Today's menu</h2></div><span>{foods.length} delicious choices</span></div>{foods.length ? sections.map((section) => <section key={section} className="menu-category"><h3>{section}</h3><div className="food-grid">{foods.filter((food) => food.category === section).map((food) => <FoodCard key={food._id} food={food} restaurant={restaurant} />)}</div></section>) : <div className="empty-state"><h2>The kitchen is getting ready.</h2><p>Check back soon for something delicious.</p></div>}</div><aside className="detail-aside"><div className="aside-note"><span>✦</span><h3>A good meal is<br />always a good idea.</h3><p>Everything is cooked fresh when you order. No rush, just really good food.</p><span className="aside-hours">OPEN TODAY · 11AM – 10PM</span></div></aside></div></div>
}
