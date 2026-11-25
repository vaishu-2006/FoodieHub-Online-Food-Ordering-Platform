import mongoose from 'mongoose'

const restaurantSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true, maxlength: 100 },
  description: { type: String, trim: true, required: true, maxlength: 500 },
  image: { type: String, trim: true, required: true },
  cuisine: { type: [{ type: String, trim: true }], required: true, validate: [(list) => list.length > 0, 'At least one cuisine is required.'] },
  rating: { type: Number, min: 0, max: 5, default: 4.7 },
  deliveryTime: { type: String, trim: true, required: true, maxlength: 40 },
  address: { type: String, trim: true, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Restaurant', restaurantSchema)
