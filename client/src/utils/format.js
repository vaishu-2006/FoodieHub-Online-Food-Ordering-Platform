export const money = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0)

export const imageUrl = (image, fallback = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=85') =>
  image || fallback

export const errorMessage = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong. Please try again.'
