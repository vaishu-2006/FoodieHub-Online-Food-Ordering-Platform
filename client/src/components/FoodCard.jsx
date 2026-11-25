import { FiMinus, FiPlus } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { money, imageUrl } from '../utils/format'
import SafeImage from './SafeImage'

export default function FoodCard({ food, restaurant }) {
  const { addToCart, cart, setQuantity } = useApp()
  const quantity = cart.find((item) => item._id === food._id)?.quantity || 0
  return (
    <article className={`food-card${!food.isAvailable ? ' food-unavailable' : ''}`}>
      <div className="food-photo"><SafeImage src={imageUrl(food.image)} alt={food.name} loading="lazy" /><span className={`food-type ${food.foodType === 'veg' ? 'veg' : 'nonveg'}`}><i />{food.foodType === 'veg' ? 'VEG' : 'NON-VEG'}</span></div>
      <div className="food-card-content"><div className="food-title-row"><h3>{food.name}</h3><strong>{money(food.price)}</strong></div><p>{food.description}</p><div className="food-card-bottom">{food.isAvailable ? <span className="available-note">Made fresh to order</span> : <span className="unavailable-note">Currently unavailable</span>}{quantity ? <div className="quantity-control"><button aria-label={`Remove one ${food.name}`} onClick={() => setQuantity(food._id, quantity - 1)}><FiMinus /></button><b>{quantity}</b><button aria-label={`Add one ${food.name}`} disabled={quantity >= 50} onClick={() => setQuantity(food._id, quantity + 1)}><FiPlus /></button></div> : <button className="add-button" disabled={!food.isAvailable} onClick={() => addToCart(food, restaurant)}><FiPlus /> Add</button>}</div></div>
    </article>
  )
}
