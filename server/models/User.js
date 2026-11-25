import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const addressSchema = new mongoose.Schema({
  label: { type: String, trim: true, maxlength: 30, default: 'Home' },
  line1: { type: String, trim: true, required: true, maxlength: 200 },
  city: { type: String, trim: true, required: true, maxlength: 80 },
  postalCode: { type: String, trim: true, required: true, maxlength: 16 },
  phone: { type: String, trim: true, required: true, maxlength: 20 },
}, { _id: true })

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true, minlength: 2, maxlength: 80 },
  email: { type: String, trim: true, lowercase: true, required: true, unique: true, maxlength: 254 },
  password: { type: String, required: true, minlength: 8, select: false },
  phone: { type: String, trim: true, required: true, maxlength: 20 },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  addresses: { type: [addressSchema], default: [] },
}, { timestamps: true })

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password)
}

export default mongoose.model('User', userSchema)
