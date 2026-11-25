import Restaurant from '../models/Restaurant.js'
import Food from '../models/Food.js'
import { AppError, asyncHandler, requireFields } from '../utils/asyncHandler.js'

const validateRestaurant = (body) => {
  requireFields({ Name: body.name, Description: body.description, Image: body.image, 'Delivery time': body.deliveryTime })
  if (!Array.isArray(body.cuisine) || !body.cuisine.some((item) => typeof item === 'string' && item.trim())) throw new AppError('Add at least one cuisine.')
  if (body.rating !== undefined && (!Number.isFinite(Number(body.rating)) || Number(body.rating) < 0 || Number(body.rating) > 5)) throw new AppError('Rating must be between 0 and 5.')
}

export const listRestaurants = asyncHandler(async (req, res) => {
  const filter = { isActive: true }
  if (req.query.cuisine) filter.cuisine = { $regex: String(req.query.cuisine), $options: 'i' }
  const restaurants = await Restaurant.find(filter).sort({ rating: -1, name: 1 })
  res.json({ restaurants })
})

export const getRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ _id: req.params.id, isActive: true })
  if (!restaurant) throw new AppError('Restaurant not found.', 404)
  res.json({ restaurant })
})

export const createRestaurant = asyncHandler(async (req, res) => {
  validateRestaurant(req.body)
  const restaurant = await Restaurant.create({
    name: req.body.name,
    description: req.body.description,
    image: req.body.image,
    cuisine: req.body.cuisine.map((item) => item.trim()).filter(Boolean),
    rating: req.body.rating ?? 4.7,
    deliveryTime: req.body.deliveryTime,
    address: req.body.address || '',
    isActive: req.body.isActive ?? true,
  })
  res.status(201).json({ restaurant })
})

export const updateRestaurant = asyncHandler(async (req, res) => {
  validateRestaurant(req.body)
  const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    description: req.body.description,
    image: req.body.image,
    cuisine: req.body.cuisine.map((item) => item.trim()).filter(Boolean),
    rating: req.body.rating ?? 4.7,
    deliveryTime: req.body.deliveryTime,
    address: req.body.address || '',
    isActive: req.body.isActive ?? true,
  }, { new: true, runValidators: true })
  if (!restaurant) throw new AppError('Restaurant not found.', 404)
  res.json({ restaurant })
})

export const deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findByIdAndDelete(req.params.id)
  if (!restaurant) throw new AppError('Restaurant not found.', 404)
  await Food.deleteMany({ restaurantId: restaurant._id })
  res.json({ message: 'Restaurant and its menu were deleted.' })
})
