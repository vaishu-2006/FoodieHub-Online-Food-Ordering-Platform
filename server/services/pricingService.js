import Coupon from '../models/Coupon.js'
import { AppError } from '../utils/asyncHandler.js'

export async function getEligibleCoupon(code, subtotal) {
  const normalizedCode = String(code || '').trim().toUpperCase()
  const coupon = await Coupon.findOne({
    code: normalizedCode,
    isActive: true,
    expiryDate: { $gt: new Date() },
  })
  if (!coupon) throw new AppError('That coupon is no longer available.')
  if (subtotal < coupon.minimumOrder) throw new AppError(`This coupon needs a minimum order of ₹${coupon.minimumOrder}.`)
  return coupon
}

export function calculateDiscount(coupon, subtotal) {
  const discount = coupon.discountType === 'percentage'
    ? Math.round(subtotal * coupon.discountValue / 100)
    : coupon.discountValue
  return Math.min(discount, subtotal)
}

export function calculateDeliveryFee(subtotal) {
  const freeThreshold = Number(process.env.FREE_DELIVERY_THRESHOLD || 500)
  const deliveryFee = Number(process.env.DELIVERY_FEE || 39)
  if (!Number.isFinite(freeThreshold) || freeThreshold < 0 || !Number.isFinite(deliveryFee) || deliveryFee < 0) {
    throw new Error('FREE_DELIVERY_THRESHOLD and DELIVERY_FEE must be non-negative numbers.')
  }
  return subtotal >= freeThreshold ? 0 : deliveryFee
}
