import { Router } from 'express'
import { createRestaurant, deleteRestaurant, getRestaurant, listRestaurants, updateRestaurant } from '../controllers/restaurantController.js'
import { adminOnly, protect } from '../middleware/auth.js'

const router = Router()
router.get('/', listRestaurants)
router.get('/:id', getRestaurant)
router.post('/', protect, adminOnly, createRestaurant)
router.put('/:id', protect, adminOnly, updateRestaurant)
router.delete('/:id', protect, adminOnly, deleteRestaurant)
export default router
