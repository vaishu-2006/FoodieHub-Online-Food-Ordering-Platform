import mongoose from 'mongoose'

const foodSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true, maxlength: 100 },
  description: { type: String, trim: true, required: true, maxlength: 400 },
  price: { type: Number, required: true, min: 1 },
  image: { type: String, trim: true, required: true },
  category: { type: String, trim: true, required: true, maxlength: 60 },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  isAvailable: { type: Boolean, default: true },
  foodType: { type: String, enum: ['veg', 'non-veg'], default: 'veg' },
}, { timestamps: true })

export default mongoose.model('Food', foodSchema)
