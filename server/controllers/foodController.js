import Food from '../models/Food.js'
import Restaurant from '../models/Restaurant.js'
import { AppError, asyncHandler, requireFields } from '../utils/asyncHandler.js'

const validateFood = (body) => {
  requireFields({ Name: body.name, Description: body.description, Image: body.image, Category: body.category, 'Restaurant ID': body.restaurantId })
  if (!Number.isFinite(Number(body.price)) || Number(body.price) <= 0) throw new AppError('Price must be a number greater than zero.')
  if (body.foodType && !['veg', 'non-veg'].includes(body.foodType)) throw new AppError('Food type must be veg or non-veg.')
}

export const listFoods = asyncHandler(async (req, res) => {
  const filter = {}
  if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId
  if (req.query.category) filter.category = { $regex: String(req.query.category), $options: 'i' }
  if (req.query.available === 'true') filter.isAvailable = true
  const foods = await Food.find(filter).populate('restaurantId', 'name isActive').sort({ category: 1, name: 1 })
  res.json({ foods: foods.filter((food) => food.restaurantId?.isActive) })
})

export const getFood = asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id).populate('restaurantId', 'name isActive')
  if (!food || !food.restaurantId?.isActive) throw new AppError('Food item not found.', 404)
  res.json({ food })
})

export const createFood = asyncHandler(async (req, res) => {
  validateFood(req.body)
  const restaurant = await Restaurant.findOne({ _id: req.body.restaurantId, isActive: true })
  if (!restaurant) throw new AppError('Choose an active restaurant for this food item.')
  const food = await Food.create({
    name: req.body.name, description: req.body.description, image: req.body.image,
    price: Number(req.body.price), category: req.body.category, restaurantId: restaurant._id,
    isAvailable: req.body.isAvailable ?? true, foodType: req.body.foodType || 'veg',
  })
  res.status(201).json({ food })
})

export const updateFood = asyncHandler(async (req, res) => {
  validateFood(req.body)
  const restaurant = await Restaurant.findOne({ _id: req.body.restaurantId, isActive: true })
  if (!restaurant) throw new AppError('Choose an active restaurant for this food item.')
  const food = await Food.findByIdAndUpdate(req.params.id, {
    name: req.body.name, description: req.body.description, image: req.body.image,
    price: Number(req.body.price), category: req.body.category, restaurantId: restaurant._id,
    isAvailable: req.body.isAvailable ?? true, foodType: req.body.foodType || 'veg',
  }, { new: true, runValidators: true })
  if (!food) throw new AppError('Food item not found.', 404)
  res.json({ food })
})

export const deleteFood = asyncHandler(async (req, res) => {
  const food = await Food.findByIdAndDelete(req.params.id)
  if (!food) throw new AppError('Food item not found.', 404)
  res.json({ message: 'Food item deleted.' })
})

export const setFoodAvailability = asyncHandler(async (req, res) => {
  if (typeof req.body.isAvailable !== 'boolean') throw new AppError('isAvailable must be true or false.')
  const food = await Food.findByIdAndUpdate(req.params.id, { isAvailable: req.body.isAvailable }, { new: true })
  if (!food) throw new AppError('Food item not found.', 404)
  res.json({ food })
})
