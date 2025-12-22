import bcrypt from 'bcryptjs'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { prisma } from './lib/prismaClient'

const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// --- Initialization & Seeding ---
const SEED_PRODUCTS = [
  {
    name: 'Pure Life Pack',
    description: 'Compact hydration options for events and meetings.',
    price: 5.5,
    image: 'https://picsum.photos/id/10/400/400',
    category: 'bottles',
    volume: 'Various Sizes',
    variants: [
      {
        name: '330ml x 24',
        price: 5.5,
        stock: 100,
        image: 'https://picsum.photos/id/10/400/400',
      },
      {
        name: '500ml x 24',
        price: 6.0,
        stock: 85,
        image: 'https://picsum.photos/id/11/400/400',
      },
    ],
  },
  {
    name: 'Family Size Pack',
    description: 'Ideal for home dining and sharing.',
    price: 7.2,
    image: 'https://picsum.photos/id/12/400/400',
    category: 'bottles',
    volume: '1.5L x 12',
    variants: [{ name: '1.5L x 12', price: 7.2, stock: 50, image: null }],
  },
  {
    name: 'Vertical Water Tank (Type A)',
    description: 'High durability stainless steel water tank. Type A Series.',
    price: 68.0,
    image: 'https://picsum.photos/id/13/400/400',
    category: 'accessories',
    volume: '100L - 2500L',
    variants: [
      {
        name: '500L (0.66m x 1.62m)',
        price: 68.0,
        stock: 10,
        image: 'https://picsum.photos/id/13/400/400',
      },
      {
        name: '1000L (0.80m x 2.01m)',
        price: 100.0,
        stock: 5,
        image: 'https://picsum.photos/id/14/400/400',
      },
      {
        name: '2000L (1.00m x 2.25m)',
        price: 170.0,
        stock: 2,
        image: 'https://picsum.photos/id/15/400/400',
      },
    ],
  },
  {
    name: 'Premium Hot & Cold Dispenser',
    description:
      'Instant access to piping hot or ice-cold water. Energy efficient compressor.',
    price: 145.0,
    image: 'https://picsum.photos/id/20/400/400',
    category: 'dispensers',
    volume: null,
    variants: [
      {
        name: 'Standard White',
        price: 145.0,
        stock: 20,
        image: 'https://picsum.photos/id/20/400/400',
      },
      {
        name: 'Matte Black',
        price: 155.0,
        stock: 15,
        image: 'https://picsum.photos/id/24/400/400',
      },
    ],
  },
  {
    name: 'Ceramic Countertop Dispenser',
    description:
      'Elegant ceramic pot for room temperature dispensing. Includes wooden stand.',
    price: 25.0,
    image: 'https://picsum.photos/id/21/400/400',
    category: 'dispensers',
    volume: null,
    variants: [{ name: 'Standard', price: 25.0, stock: 40, image: null }],
  },
  {
    name: 'Manual Pump',
    description:
      'Simple, portable hand pump for 18.9L bottles. Great for camping.',
    price: 5.0,
    image: 'https://picsum.photos/id/22/400/400',
    category: 'accessories',
    volume: null,
    variants: [{ name: 'Standard', price: 5.0, stock: 200, image: null }],
  },
]

// const initDb = async () => {
//   try {
//     // First, try a simple query to check connection
//     await prisma.$connect()
//     console.log('Database connected successfully')

//     const productCount = await prisma.product.count()

//     if (productCount === 0) {
//       console.log('Database empty. Seeding products...')
//       for (const p of SEED_PRODUCTS) {
//         await prisma.product.create({
//           data: {
//             name: p.name,
//             description: p.description,
//             price: p.price,
//             image: p.image,
//             category: p.category,
//             volume: p.volume,
//             variants: {
//               create: p.variants.map((v) => ({
//                 name: v.name,
//                 price: v.price,
//                 stock: v.stock,
//                 image: v.image,
//               })),
//             },
//           },
//         })
//       }
//       console.log('Product seeding complete.')
//     }

//     // Seed Admin User
//     const adminUser = await prisma.user.findUnique({
//       where: { username: 'admin' },
//     })

//     if (!adminUser) {
//       const hashedPassword = await bcrypt.hash('123456', 10)
//       await prisma.user.create({
//         data: {
//           username: 'admin',
//           password: hashedPassword,
//           role: 'admin',
//         },
//       })
//       console.log('Admin user seeded (admin/123456).')
//     }
//   } catch (err) {
//     console.error('Database initialization failed:', err)
//   }
// }
// --- API Routes ---

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (isMatch) {
      res.json({
        user: { id: user.id, username: user.username, role: user.role },
      })
    } else {
      res.status(401).json({ error: 'Invalid credentials' })
    }
  } catch (e) {
    console.error('Login error:', e)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET All Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { variants: true, category: true },
      orderBy: { id: 'desc' },
    })
    res.json(products)
  } catch (err) {
    console.error('Error fetching products:', err)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// GET Single Product
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { variants: true },
    })

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' })
    }

    res.json(product)
  } catch (err) {
    console.error('Error fetching product:', err)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// CREATE Product
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, image, categoryId, volume, variants } =
      req.body

    if (!name || price === undefined) {
      return res.status(400).json({ msg: 'Name and Price are required' })
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        image: image || '',
        categoryId: categoryId,
        volume: volume || null,
        variants: {
          create: (variants || []).map((v) => ({
            name: v.name,
            price: parseFloat(v.price),
            stock: parseInt(v.stock) || 0,
            sku: v.sku || null,
            image: v.image || null,
          })),
        },
      },
      include: { variants: true },
    })

    res.json(newProduct)
  } catch (err) {
    console.error('Error creating product:', err)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// UPDATE Product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      description,
      price,
      image,
      category,
      volume,
      variants,
      brand,
    } = req.body

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        category,
        volume,
        brand,
        variants: {
          // Transactionally delete old variants and create new ones
          deleteMany: {},
          create: (variants || []).map((v) => ({
            name: v.name,
            price: parseFloat(v.price),
            stock: parseInt(v.stock) || 0,
            sku: v.sku || null,
            image: v.image || null,
          })),
        },
      },
      include: { variants: true },
    })

    res.json(updatedProduct)
  } catch (err) {
    console.error('Error updating product:', err)
    if (err.code === 'P2025') {
      return res.status(404).json({ msg: 'Product not found' })
    }
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// DELETE Product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.product.delete({
      where: { id: Number(id) },
    })

    res.json({ msg: 'Product deleted' })
  } catch (err) {
    console.error('Error deleting product:', err)
    if (err.code === 'P2025') {
      return res.status(404).json({ msg: 'Product not found' })
    }
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

app.post('/api/videos', async (req, res) => {
  const video = await prisma.video.create({
    data: req.body,
  })
  res.json(video)
})

app.get('/api/videos', async (req, res) => {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: 'desc' },
  })
  res.json(videos)
})

app.put('/api/videos/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, videoUrl, thumbnail } = req.body
    const updatedVideo = await prisma.video.update({
      where: { id: Number(id) },
      data: { title, description, videoUrl, thumbnail },
    })

    res.json(updatedVideo)
  } catch (err) {
    console.error('Error updating video:', err)
    res.status(500).json({ error: 'Failed to update video' })
  }
})

app.delete('/api/videos/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.video.delete({
      where: { id: Number(id) },
    })

    res.json({ msg: 'Video deleted' })
  } catch (err) {
    console.error('Error deleting video:', err)
    if (err.code === 'P2025') {
      return res.status(404).json({ msg: 'Video not found' })
    }
    res.status(500).json({ error: 'Failed to delete video' })
  }
})

// --- Categories ---
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json(categories)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

app.post('/api/categories', async (req, res) => {
  try {
    const { name, brand, displayName } = req.body
    if (!name) return res.status(400).json({ msg: 'Name is required' })

    const newCat = await prisma.category.create({
      data: { name, brand: brand || null, displayName: displayName || null },
    })
    res.json(newCat)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create category' })
  }
})

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params
    res.json({ msg: 'Category deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete category' })
  }
})

app.listen(port, () => {
  console.log(`Server running with Prisma + PostgreSQL on port ${port}`)

  // setTimeout(async () => {
  //   console.log('Starting database initialization...')
  //   await initDb()
  // }, 1000)
})
