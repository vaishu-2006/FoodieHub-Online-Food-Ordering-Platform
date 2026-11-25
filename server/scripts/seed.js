import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDatabase } from '../config/db.js'
import Coupon from '../models/Coupon.js'
import Food from '../models/Food.js'
import Restaurant from '../models/Restaurant.js'

const restaurants = [
  {
    name: 'Little Olive Pizzeria',
    description: 'Slow-fermented dough, sun-ripened tomatoes, and the kind of crust you think about later.',
    image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1200&q=85',
    cuisine: ['Pizza', 'Italian'], rating: 4.9, deliveryTime: '20–30 min', address: 'Indiranagar, Bengaluru',
    foods: [
      ['Margherita, The Classic', 'San Marzano tomato, creamy mozzarella, fresh basil.', 349, 'Pizza', 'veg', 'photo-1579751626657-72bc17010498'],
      ['The Garden Party', 'Roasted peppers, olives, spinach, and a little feta.', 429, 'Pizza', 'veg', 'photo-1571407970349-bc81e7e96d47'],
      ['Mushroom & Truffle', 'Wild mushrooms, mozzarella, and a whisper of truffle oil.', 479, 'Pizza', 'veg', 'photo-1579751626657-72bc17010498'],
      ['Basil Pesto Pasta', 'Pillowy pasta, basil pesto, parmesan, and toasted pine nuts.', 369, 'Italian', 'veg', 'photo-1473093295043-cdd812d0e601'],
      ['Tiramisu for Two', 'Coffee-soaked layers, mascarpone cream, cocoa dust.', 229, 'Desserts', 'veg', 'photo-1571877227200-a0d98ea607e9'],
    ],
  },
  {
    name: 'The Sunday Table',
    description: 'Comfort food with a little extra love. A familiar favorite, whatever the day.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=85',
    cuisine: ['Indian', 'North Indian'], rating: 4.8, deliveryTime: '25–35 min', address: 'Koramangala, Bengaluru',
    foods: [
      ['Slow-Cooked Butter Paneer', 'Creamy tomato gravy, house-spiced paneer, a touch of kasuri methi.', 329, 'Indian', 'veg', 'photo-1631452180519-c014fe946bc7'],
      ['Dal Makhani, All Day', 'Black lentils simmered low and slow, finished with a swirl of cream.', 279, 'Indian', 'veg', 'photo-1546833999-b9f581a1996d'],
      ['Chicken Biryani', 'Fragrant basmati, tender chicken, and a little bit of magic.', 379, 'Indian', 'non-veg', 'photo-1563379091339-03246963d51a'],
      ['Garlic Butter Naan', 'Soft, pillowy naan brushed with garlic butter.', 69, 'Sides', 'veg', 'photo-1601050690597-df0568f70950'],
      ['Gulab Jamun', 'Warm, syrupy, melt-in-your-mouth. You know the ones.', 119, 'Desserts', 'veg', 'photo-1666190092159-eec5e7b0a7db'],
    ],
  },
  {
    name: 'Good Neighbor Burger Co.',
    description: 'Smash burgers, proper fries, and good-neighbor energy. Napkins highly encouraged.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85',
    cuisine: ['Burgers', 'American'], rating: 4.7, deliveryTime: '20–30 min', address: 'HSR Layout, Bengaluru',
    foods: [
      ['The Good Neighbor', 'Double smash patty, aged cheddar, pickles, and our house sauce.', 349, 'Burgers', 'non-veg', 'photo-1568901346375-23c9450c58cd'],
      ['Crispy Chickpea Burger', 'Herby chickpea patty, crunchy slaw, and lemon tahini.', 289, 'Burgers', 'veg', 'photo-1553979459-d2229ba7433a'],
      ['Truffle Parmesan Fries', 'Crispy fries, parmesan, and just enough truffle.', 179, 'Sides', 'veg', 'photo-1573080496219-bb080dd4f877'],
      ['Crispy Chicken Tenders', 'Buttermilk-marinated, golden-crunchy, with ranch on the side.', 249, 'Sides', 'non-veg', 'photo-1562967914-608f82629710'],
      ['Chocolate Fudge Brownie', 'Warm, gooey in the middle, extra chocolatey all over.', 159, 'Desserts', 'veg', 'photo-1606313564200-e75d5e30476c'],
    ],
  },
  {
    name: 'Wok This Way',
    description: 'Big wok energy. Hand-tossed noodles and dumplings that disappear suspiciously fast.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=85',
    cuisine: ['Chinese', 'Asian'], rating: 4.6, deliveryTime: '25–35 min', address: 'Jubilee Hills, Hyderabad',
    foods: [
      ['Chilli Garlic Noodles', 'Wok-tossed noodles, fresh greens, a little fire, lots of flavor.', 279, 'Chinese', 'veg', 'photo-1569718212165-3a8278d5f624'],
      ['Crispy Chilli Chicken', 'Crisp chicken, bell peppers, a sweet-and-spicy glaze.', 359, 'Chinese', 'non-veg', 'photo-1525755662778-989d0524087e'],
      ['Veg Momos, Steamed', 'Soft little parcels filled with ginger-scented vegetables.', 189, 'Chinese', 'veg', 'photo-1563245372-f21724e3856d'],
      ['Sesame Tofu Rice Bowl', 'Crispy sesame tofu, fluffy rice, crunchy greens.', 299, 'Chinese', 'veg', 'photo-1512058564366-18510be2db19'],
      ['Mango Iced Tea', 'Real mango, fresh-brewed tea, served over ice.', 119, 'Beverages', 'veg', 'photo-1556679343-c7306c1976bc'],
    ],
  },
  {
    name: 'Cloud Nine Bakehouse',
    description: 'Small-batch bakes, big-time comfort. A little sweetness for your everyday.',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=85',
    cuisine: ['Desserts', 'Bakery'], rating: 4.9, deliveryTime: '15–25 min', address: 'Whitefield, Bengaluru',
    foods: [
      ['Strawberry Cream Cake', 'Soft vanilla sponge, whipped cream, fresh berries.', 249, 'Desserts', 'veg', 'photo-1578985545062-69928b1d9587'],
      ['Pistachio Croissant', 'Flaky, buttery layers filled with roasted pistachio cream.', 189, 'Desserts', 'veg', 'photo-1555507036-ab1f4038808a'],
      ['Salted Caramel Cookie', 'Crisp edges, soft middle, pools of caramel.', 99, 'Desserts', 'veg', 'photo-1499636136210-6f4ee915583e'],
      ['Iced Vanilla Latte', 'Double espresso, cold milk, a little vanilla.', 169, 'Beverages', 'veg', 'photo-1461023058943-07fcbe16d735'],
      ['Blueberry Cheesecake', 'Creamy New York-style cheesecake, bright blueberry compote.', 229, 'Desserts', 'veg', 'photo-1533134242443-d4fd215305ad'],
    ],
  },
]

try {
  await connectDatabase()
  for (const data of restaurants) {
    const restaurant = await Restaurant.findOneAndUpdate(
      { name: data.name },
      { $set: { name: data.name, description: data.description, image: data.image, cuisine: data.cuisine, rating: data.rating, deliveryTime: data.deliveryTime, address: data.address, isActive: true } },
      { upsert: true, new: true, runValidators: true },
    )
    for (const [name, description, price, category, foodType, photo] of data.foods) {
      await Food.findOneAndUpdate(
        { name, restaurantId: restaurant._id },
        { $set: { name, description, price, category, foodType, image: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=800&q=85`, restaurantId: restaurant._id, isAvailable: true } },
        { upsert: true, new: true, runValidators: true },
      )
    }
  }
  await Coupon.findOneAndUpdate(
    { code: 'FIRSTBITE' },
    { $set: { code: 'FIRSTBITE', discountType: 'percentage', discountValue: 15, minimumOrder: 299, expiryDate: new Date(Date.now() + 365 * 86400000), isActive: true } },
    { upsert: true, new: true, runValidators: true },
  )
  console.log(`Seeded ${restaurants.length} restaurants, ${restaurants.reduce((sum, item) => sum + item.foods.length, 0)} menu items, and FIRSTBITE coupon.`)
} catch (error) {
  console.error(`Seed failed: ${error.message}`)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
