import { Router } from 'express'
import { customers, dashboard, inventory } from '../controllers/adminController.js'
import { listOrders } from '../controllers/orderController.js'
import { adminOnly, protect } from '../middleware/auth.js'

const router = Router()
router.use(protect, adminOnly)
router.get('/dashboard', dashboard)
router.get('/orders', listOrders)
router.get('/customers', customers)
router.get('/inventory', inventory)
export default router
