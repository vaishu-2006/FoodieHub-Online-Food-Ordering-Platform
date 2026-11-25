import { Link } from 'react-router-dom'
import { FiArrowUpRight, FiClock, FiStar } from 'react-icons/fi'
import { imageUrl } from '../utils/format'
import SafeImage from './SafeImage'

export default function RestaurantCard({ restaurant }) {
  return (
    <Link to={`/restaurant/${restaurant._id}`} className="restaurant-card">
      <div className="restaurant-image-wrap"><SafeImage src={imageUrl(restaurant.image)} alt={restaurant.name} /><span className="delivery-pill"><FiClock /> {restaurant.deliveryTime || '25–35 min'}</span><span className="image-arrow"><FiArrowUpRight /></span></div>
      <div className="restaurant-info"><div><h3>{restaurant.name}</h3><p>{restaurant.cuisine?.join(' · ') || 'Kitchen favorites'}</p></div><span className="rating"><FiStar /> {Number(restaurant.rating || 4.7).toFixed(1)}</span></div>
      {restaurant.description && <p className="restaurant-desc">{restaurant.description}</p>}
    </Link>
  )
}
