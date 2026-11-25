import { AppError, asyncHandler } from '../utils/asyncHandler.js'
import { calculateDiscount, getEligibleCoupon } from '../services/pricingService.js'

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body
  if (typeof code !== 'string' || !code.trim()) throw new AppError('Enter a coupon code.')
  if (!Number.isFinite(Number(subtotal)) || Number(subtotal) <= 0) throw new AppError('Add items to your bag before applying a coupon.')
  const coupon = await getEligibleCoupon(code, Number(subtotal))
  res.json({ code: coupon.code, discount: calculateDiscount(coupon, Number(subtotal)) })
})
