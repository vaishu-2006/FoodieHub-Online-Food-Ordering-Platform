import mongoose from 'mongoose'
import Food from '../models/Food.js'
import Order from '../models/Order.js'
import Restaurant from '../models/Restaurant.js'
import User from '../models/User.js'
import { AppError, asyncHandler, requireFields } from '../utils/asyncHandler.js'
import { calculateDeliveryFee, calculateDiscount, getEligibleCoupon } from '../services/pricingService.js'

const allowedStatuses = ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']

export const createOrder = asyncHandler(async (req, res) => {
  const { restaurantId, items, deliveryAddress, paymentMethod, couponCode } = req.body
  if (!mongoose.isValidObjectId(restaurantId)) throw new AppError('Choose a valid restaurant.')
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) throw new AppError('Add at least one item to your order.')
  if (paymentMethod !== 'cash_on_delivery') throw new AppError('Cash on delivery is the only enabled payment method.')
  requireFields({
    'Recipient name': deliveryAddress?.name,
    'Street address': deliveryAddress?.line1,
    City: deliveryAddress?.city,
    'Postal code': deliveryAddress?.postalCode,
    'Phone number': deliveryAddress?.phone,
  })
  const restaurant = await Restaurant.findOne({ _id: restaurantId, isActive: true })
  if (!restaurant) throw new AppError('This restaurant is currently unavailable.', 409)
  const ids = items.map((item) => item.foodId)
  if (ids.some((id) => !mongoose.isValidObjectId(id)) || new Set(ids.map(String)).size !== ids.length) {
    throw new AppError('Your cart contains an invalid or duplicate item.')
  }
  const foods = await Food.find({ _id: { $in: ids }, restaurantId, isAvailable: true })
  if (foods.length !== items.length) throw new AppError('One or more items are unavailable. Please refresh your cart.', 409)
  const foodById = new Map(foods.map((food) => [String(food._id), food]))
  const orderItems = items.map((item) => {
    const food = foodById.get(String(item.foodId))
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) throw new AppError('Each item quantity must be between 1 and 50.')
    return { foodId: food._id, name: food.name, price: food.price, quantity: item.quantity }
  })
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = calculateDeliveryFee(subtotal)
  let discount = 0
  let normalizedCoupon = ''
  if (couponCode) {
    const coupon = await getEligibleCoupon(couponCode, subtotal)
    discount = calculateDiscount(coupon, subtotal)
    normalizedCoupon = coupon.code
  }
  const order = await Order.create({
    userId: req.user._id, restaurantId, items: orderItems,
    deliveryAddress: {
      label: String(deliveryAddress.label || 'Home').trim(),
      name: String(deliveryAddress.name).trim(),
      line1: String(deliveryAddress.line1).trim(),
      city: String(deliveryAddress.city).trim(),
      postalCode: String(deliveryAddress.postalCode).trim(),
      phone: String(deliveryAddress.phone).trim(),
    },
    subtotal, deliveryFee, discount, couponCode: normalizedCoupon,
    totalAmount: subtotal + deliveryFee - discount,
    paymentMethod: 'cash_on_delivery',
  })
  const savedAddress = {
    label: order.deliveryAddress.label, line1: order.deliveryAddress.line1,
    city: order.deliveryAddress.city, postalCode: order.deliveryAddress.postalCode,
    phone: order.deliveryAddress.phone,
  }
  await User.updateOne(
    { _id: req.user._id, 'addresses.line1': { $ne: savedAddress.line1 }, 'addresses.city': { $ne: savedAddress.city } },
    { $push: { addresses: savedAddress } },
  )
  res.status(201).json({ order: await order.populate('restaurantId', 'name image deliveryTime') })
})

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).populate('restaurantId', 'name image deliveryTime').sort({ createdAt: -1 })
  res.json({ orders })
})

export const getOrder = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id }
  if (req.user.role !== 'admin') filter.userId = req.user._id
  const order = await Order.findOne(filter).populate('restaurantId', 'name image deliveryTime')
  if (!order) throw new AppError('Order not found.', 404)
  res.json({ order })
})

export const listOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('restaurantId', 'name').populate('userId', 'name email phone').sort({ createdAt: -1 }).limit(200)
  res.json({ orders })
})

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body
  if (!allowedStatuses.includes(orderStatus)) throw new AppError('Choose a valid order status.')
  const order = await Order.findById(req.params.id)
  if (!order) throw new AppError('Order not found.', 404)
  if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') throw new AppError('This order is already complete and cannot be changed.', 409)
  const nextStatus = { placed: ['confirmed', 'cancelled'], confirmed: ['preparing', 'cancelled'], preparing: ['out_for_delivery', 'cancelled'], out_for_delivery: ['delivered', 'cancelled'] }
  if (!nextStatus[order.orderStatus]?.includes(orderStatus)) throw new AppError(`An order cannot move from ${order.orderStatus} to ${orderStatus}.`, 409)
  order.orderStatus = orderStatus
  await order.save()
  res.json({ order: await order.populate('restaurantId', 'name image deliveryTime') })
})
