import { Router } from 'express'
import { createOrder, getOrder, listOrders, myOrders, updateOrderStatus } from '../controllers/orderController.js'
import { adminOnly, protect } from '../middleware/auth.js'

const router = Router()
router.use(protect)
router.post('/', createOrder)
router.get('/my-orders', myOrders)
router.get('/', adminOnly, listOrders)
router.get('/:id', getOrder)
router.put('/:id/status', adminOnly, updateOrderStatus)
export default router
