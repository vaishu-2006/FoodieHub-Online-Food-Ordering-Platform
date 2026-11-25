import Food from '../models/Food.js'
import Order from '../models/Order.js'
import Restaurant from '../models/Restaurant.js'
import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const dashboard = asyncHandler(async (req, res) => {
  const [totalOrders, totalCustomers, totalRestaurants, revenue, recentOrders, daily] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Restaurant.countDocuments(),
    Order.aggregate([{ $match: { orderStatus: { $nin: ['cancelled'] } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Order.find().populate('userId', 'name email').populate('restaurantId', 'name').sort({ createdAt: -1 }).limit(6),
    Order.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 6 * 86400000) }, orderStatus: { $nin: ['cancelled'] } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ])
  res.json({ stats: { totalOrders, totalCustomers, totalRestaurants, totalRevenue: revenue[0]?.total || 0 }, recentOrders, daily })
})

export const customers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'customer' }).select('name email phone createdAt').sort({ createdAt: -1 }).limit(250)
  res.json({ customers: users })
})

export const inventory = asyncHandler(async (req, res) => {
  const [restaurants, foods] = await Promise.all([
    Restaurant.find().sort({ name: 1 }),
    Food.find().populate('restaurantId', 'name').sort({ category: 1, name: 1 }),
  ])
  res.json({ restaurants, foods })
})
