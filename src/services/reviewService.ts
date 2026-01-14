import { Review } from '../types'

const STORAGE_KEY = 'h2o_reviews'

const getAllReviews = (): Record<number, Review[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (e) {
    console.error('Failed to parse reviews', e)
    return {}
  }
}

export const getReviewsForProduct = (productId: number): Review[] => {
  const all = getAllReviews()
  return (all[productId] || []).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export const addReview = (
  productId: number,
  review: Omit<Review, 'id' | 'productId' | 'date'>
): Review => {
  const all = getAllReviews()
  const newReview: Review = {
    ...review,
    id: Date.now().toString(),
    productId,
    date: new Date().toISOString(),
  }

  if (!all[productId]) {
    all[productId] = []
  }
  all[productId].push(newReview)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  return newReview
}
