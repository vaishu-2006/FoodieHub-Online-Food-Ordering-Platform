import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { connectDatabase } from './config/db.js'
import adminRoutes from './routes/adminRoutes.js'
import authRoutes from './routes/authRoutes.js'
import couponRoutes from './routes/couponRoutes.js'
import foodRoutes from './routes/foodRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import restaurantRoutes from './routes/restaurantRoutes.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { validateJsonBody } from './middleware/validateJsonBody.js'

const app = express()
app.disable('x-powered-by')
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))
app.use(validateJsonBody)
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'FoodieHub API' }))
app.use('/api/auth', authRoutes)
app.use('/api/restaurants', restaurantRoutes)
app.use('/api/foods', foodRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/coupons', couponRoutes)
app.use(notFound)
app.use(errorHandler)

const port = Number(process.env.PORT || 5000)
connectDatabase()
  .then(() => app.listen(port, () => console.log(`FoodieHub API listening on http://localhost:${port}`)))
  .catch((error) => {
    console.error(`Unable to start FoodieHub API: ${error.message}`)
    process.exitCode = 1
  })
