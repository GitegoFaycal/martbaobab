// Photo backgrounds for category tiles, served from /public/categories/<slug>.jpg.
const KNOWN = new Set([
  "food-groceries", "drinks-water", "fresh-produce", "phones-electronics", "clothing-shoes",
  "home-kitchen", "beauty-care", "baby-kids", "building-materials", "furniture",
  "motorbikes-bicycles", "gas-charcoal", "stationery-school", "agriculture-livestock",
  "moto-delivery", "plumbing-electrical", "tailoring", "salon-barber", "phone-computer-repair",
  "cleaning-laundry", "catering-events", "tutoring-training", "mechanics", "photography-video",
  "construction", "factory", "farming", "house-help", "security", "driver-rider",
  "shop-restaurant", "cleaning-gardening", "loading-porter", "skilled-trades", "office-sales", "other-work",
]);

export function categoryImage(slug) {
  return `/categories/${KNOWN.has(slug) ? slug : "other-work"}.jpg`;
}
