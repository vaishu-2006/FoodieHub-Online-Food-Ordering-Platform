import { Router } from 'express'
import { createFood, deleteFood, getFood, listFoods, setFoodAvailability, updateFood } from '../controllers/foodController.js'
import { adminOnly, protect } from '../middleware/auth.js'

const router = Router()
router.get('/', listFoods)
router.get('/:id', getFood)
router.post('/', protect, adminOnly, createFood)
router.put('/:id', protect, adminOnly, updateFood)
router.patch('/:id/availability', protect, adminOnly, setFoodAvailability)
router.delete('/:id', protect, adminOnly, deleteFood)
export default router
