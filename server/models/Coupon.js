import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema({
  code: { type: String, trim: true, uppercase: true, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true, min: 1 },
  minimumOrder: { type: Number, default: 0, min: 0 },
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Coupon', couponSchema)
