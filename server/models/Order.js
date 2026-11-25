import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1, max: 50 },
}, { _id: false })

const deliveryAddressSchema = new mongoose.Schema({
  label: { type: String, trim: true, default: 'Home' },
  name: { type: String, trim: true, required: true },
  line1: { type: String, trim: true, required: true },
  city: { type: String, trim: true, required: true },
  postalCode: { type: String, trim: true, required: true },
  phone: { type: String, trim: true, required: true },
}, { _id: false })

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: { type: [orderItemSchema], required: true, validate: [(items) => items.length > 0, 'An order needs at least one item.'] },
  deliveryAddress: { type: deliveryAddressSchema, required: true },
  subtotal: { type: Number, required: true, min: 0 },
  deliveryFee: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  couponCode: { type: String, default: '' },
  totalAmount: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ['cash_on_delivery'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'], default: 'placed', index: true },
}, { timestamps: true })

export default mongoose.model('Order', orderSchema)
