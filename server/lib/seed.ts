import bcrypt from 'bcryptjs'
import { prisma } from './prismaClient'
// Products with their default variants
const productsWithVariants = [
  // Category: Makeup
  {
    product: {
      name: 'Matte Liquid Lipstick - Velvet Red',
      slug: 'matte-liquid-lipstick-velvet-red',
      description: 'Long-lasting matte liquid lipstick with velvety finish',
      price: 18.99,
      image:
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
      volume: '5ml',
      brand: 'Glamour Cosmetics',
      categoryId: 5, // Makeup category
    },
    variant: {
      name: 'Velvet Red',
      price: 18.99,
      stock: 50,
      sku: 'LIP-RED-001',
      image:
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w-400&h=400&fit=crop',
    },
  },
  {
    product: {
      name: '24H Foundation - Porcelain',
      slug: '24h-foundation-porcelain',
      description: 'Full coverage foundation with 24-hour staying power',
      price: 29.99,
      image:
        'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop',
      volume: '30ml',
      brand: 'Beauty Pro',
      categoryId: 5,
    },
    variant: {
      name: 'Porcelain',
      price: 29.99,
      stock: 35,
      sku: 'FND-POR-001',
      image:
        'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop',
    },
  },

  // Category: Skincare
  {
    product: {
      name: 'Hydrating Facial Serum',
      slug: 'hydrating-facial-serum',
      description: 'Intense hydration serum with hyaluronic acid',
      price: 45.5,
      image:
        'https://images.unsplash.com/photo-1556228578-9c360e2d0b4a?w=400&h=400&fit=crop',
      volume: '30ml',
      brand: 'SkinScience',
      categoryId: 6, // Skincare category
    },
    variant: {
      name: 'Original Formula',
      price: 45.5,
      stock: 25,
      sku: 'SER-HYD-001',
      image:
        'https://images.unsplash.com/photo-1556228578-9c360e2d0b4a?w=400&h=400&fit=crop',
    },
  },
  {
    product: {
      name: 'Vitamin C Brightening Cream',
      slug: 'vitamin-c-brightening-cream',
      description: 'Brightens complexion and reduces dark spots',
      price: 38.75,
      image:
        'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop',
      volume: '50ml',
      brand: 'DermaGlow',
      categoryId: 6,
    },
    variant: {
      name: 'Standard Size',
      price: 38.75,
      stock: 40,
      sku: 'CRM-VITC-001',
      image:
        'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop',
    },
  },
  {
    product: {
      name: 'Gentle Cleansing Oil',
      slug: 'gentle-cleansing-oil',
      description:
        'Oil-based cleanser that removes makeup without stripping skin',
      price: 28.0,
      image:
        'https://images.unsplash.com/photo-1591081658714-f576fb7ea3ed?w=400&h=400&fit=crop',
      volume: '200ml',
      brand: 'PureSkin',
      categoryId: 6,
    },
    variant: {
      name: 'Normal Skin',
      price: 28.0,
      stock: 60,
      sku: 'CLN-OIL-001',
      image:
        'https://images.unsplash.com/photo-1591081658714-f576fb7ea3ed?w=400&h=400&fit=crop',
    },
  },

  // Category: Fragrance
  {
    product: {
      name: 'Midnight Bloom Eau de Parfum',
      slug: 'midnight-bloom-eau-de-parfum',
      description:
        'Seductive floral fragrance with notes of jasmine and sandalwood',
      price: 89.99,
      image:
        'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
      volume: '100ml',
      brand: 'ScentCraft',
      categoryId: 7, // Fragrance category
    },
    variant: {
      name: '100ml Spray',
      price: 89.99,
      stock: 20,
      sku: 'PER-MID-001',
      image:
        'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
    },
  },
  {
    product: {
      name: 'Citrus Zest Eau de Toilette',
      slug: 'citrus-zest-eau-de-toilette',
      description: 'Fresh and energizing citrus fragrance',
      price: 65.5,
      image:
        'https://images.unsplash.com/photo-1590736969954-6fb5a2e90e0f?w=400&h=400&fit=crop',
      volume: '75ml',
      brand: 'AromaEssence',
      categoryId: 7,
    },
    variant: {
      name: '75ml Bottle',
      price: 65.5,
      stock: 30,
      sku: 'PER-CIT-001',
      image:
        'https://images.unsplash.com/photo-1590736969954-6fb5a2e90e0f?w=400&h=400&fit=crop',
    },
  },

  // Category: Haircare
  {
    product: {
      name: 'Argan Oil Hair Mask',
      slug: 'argan-oil-hair-mask',
      description: 'Deep conditioning treatment for dry and damaged hair',
      price: 24.99,
      image:
        'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop',
      volume: '250ml',
      brand: 'HairRevive',
      categoryId: 8, // Haircare category
    },
    variant: {
      name: 'For Dry Hair',
      price: 24.99,
      stock: 45,
      sku: 'HRM-ARG-001',
      image:
        'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop',
    },
  },
  {
    product: {
      name: 'Volume Boosting Shampoo',
      slug: 'volume-boosting-shampoo',
      description: 'Adds body and fullness to fine, flat hair',
      price: 19.5,
      image:
        'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
      volume: '400ml',
      brand: 'VolumeMax',
      categoryId: 8,
    },
    variant: {
      name: 'Normal to Fine Hair',
      price: 19.5,
      stock: 55,
      sku: 'SHP-VOL-001',
      image:
        'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
    },
  },
  {
    product: {
      name: 'Heat Protectant Spray',
      slug: 'heat-protectant-spray',
      description: 'Protects hair from heat styling up to 450°F',
      price: 16.75,
      image:
        'https://images.unsplash.com/photo-1603539308016-16ee5ff8c3e6?w=400&h=400&fit=crop',
      volume: '200ml',
      brand: 'StyleGuard',
      categoryId: 8,
    },
    variant: {
      name: 'All Hair Types',
      price: 16.75,
      stock: 70,
      sku: 'SPR-HEAT-001',
      image:
        'https://images.unsplash.com/photo-1603539308016-16ee5ff8c3e6?w=400&h=400&fit=crop',
    },
  },
]
async function cleanup() {
  console.log('🧹 Cleaning up existing data...')

  // Delete in reverse order of dependencies to respect foreign key constraints

  // await prisma.product.deleteMany();
  // await prisma.category.deleteMany();
  await prisma.user.deleteMany()

  console.log('✅ Cleanup completed')
}

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean up existing data first
  await cleanup()

  // 1. Create users
  const hashedPassword = await bcrypt.hash('Admin@123', 12)

  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@admin.com' },
    update: {},
    create: {
      email: 'superadmin@admin.com',
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Super Admin',
    },
  })
  const Brands = ['grown', 'diamond']

  await prisma.category.upsert({
    where: { slug: 'grown_plastic' },
    update: {},
    create: {
      name: 'Plastic',
      brand: 'grown',
      slug: 'grown_plastic',
    },
  })

  await prisma.category.upsert({
    where: { slug: 'grown_stainless_steel' },
    update: {},
    create: {
      name: 'Stainless Steel',
      brand: 'grown',
      slug: 'grown_stainless_steel',
    },
  })

  await prisma.category.upsert({
    where: { slug: 'diamond_plastic' },
    update: {},
    create: {
      name: 'Plastic',
      brand: 'diamond',
      slug: 'diamond_plastic',
    },
  })

  await prisma.category.upsert({
    where: { slug: 'diamond_stainless_steel' },
    update: {},
    create: {
      name: 'Stainless Steel',
      brand: 'diamond',
      slug: 'diamond_stainless_steel',
    },
  })

  console.log('\nCreating products with variants...')

  // for (const item of productsWithVariants) {
  //   // Create product
  //   const product = await prisma.product.create({
  //     data: item.product,
  //   })

  //   console.log(`Created product: ${product.name} (ID: ${product.id})`)

  //   // Create default variant for this product
  //   const variant = await prisma.variant.create({
  //     data: {
  //       ...item.variant,
  //       productId: product.id,
  //     },
  //   })

  //   console.log(
  //     `Created variant: ${variant.name || 'Default'} for product ID: ${
  //       product.id
  //     }`
  //   )
  // }

  console.log('✅ Database seeded successfully!')
  console.log('\n📋 Created:')
  console.log(`- Users:  Admin`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
