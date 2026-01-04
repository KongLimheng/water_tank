import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import slugify from 'slugify'
import { fileURLToPath } from 'url'
import AppError from './lib/AppError.js'
import globalError from './lib/globalError.js'
import { asyncHandler, comparePassword } from './lib/password.js'
import { prisma } from './lib/prismaClient.js'
import upload from './lib/upload.js'

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 5000

// ⚡ SERVE STATIC FILES FROM VITE BUILD
const staticPath = path.join(__dirname, '..', 'uploads')
app.use('/uploads', express.static(staticPath))

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.set('trust proxy', 1)
// --- API Routes ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await prisma.user.findFirst({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      res.status(400).json({ error: 'Email or password is incorrect.' })
    }

    res.json({ user: { id: user.id, email: user.email, role: user.role } })
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

//Get products by brand and category
app.get('/api/products/:brand/:category', async (req, res) => {
  try {
    const { brand, category } = req.params
    const products = await prisma.product.findMany({
      where: {
        category: {
          brand,
          slug: category !== 'all' ? category : undefined,
        },
      },
      include: { variants: true, category: true },
      orderBy: { id: 'desc' },
    })
    res.json(products)
  } catch (err) {
    console.error('Error fetching products by brand and category:', err)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// CREATE Product
app.post('/api/products', upload.any(), async (req, res) => {
  try {
    const { name, description, price, categoryId, volume, variants, brand } =
      req.body

    if (!name) {
      return res.status(400).json({ msg: 'Name and Price are required' })
    }

    let parsedVariants: any[] = []

    try {
      parsedVariants = variants ? JSON.parse(variants) : []
    } catch {
      throw new AppError(400, 'Invalid variants JSON format')
    }
    const files = (req.files as Express.Multer.File[]) || []
    const baseUrl = `${req.protocol}://${req.get('host')}`
    // Handle Images
    let mainImage = ''
    let galleryPaths: string[] = []
    let existingImage = req.body.existingImage

    if (files && files.length > 0) {
      // Construct full URLs
      const fileUrls = files.map(
        (f) => `${baseUrl}/uploads/products/${f.filename}`
      )
      mainImage = fileUrls[0]
      galleryPaths = fileUrls
    } else if (existingImage) {
      mainImage = existingImage
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '_') + `_${Date.now()}`,
        description: description || '',
        price: parseFloat(price),
        brand,
        image: galleryPaths,
        categoryId: parseInt(categoryId),
        volume: volume || null,
        variants: {
          create: parsedVariants.map((v: any) => ({
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
app.put('/api/products/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      description,
      price,
      volume,
      variants,
      brand,
      categoryId,
      existingGallery,
    } = req.body
    const files = (req.files as Express.Multer.File[]) || []
    const baseUrl = `${req.protocol}://${req.get('host')}`
    let galleryPaths: string[] = []

    if (files && files.length > 0) {
      // Construct full URLs
      const fileUrls = files.map(
        (f) => `${baseUrl}/uploads/products/${f.filename}`
      )
      galleryPaths = fileUrls
    }

    let existingImage: string[] = []
    try {
      existingImage = existingGallery ? JSON.parse(existingGallery) : []
    } catch {
      throw new AppError(400, 'Invalid existingGallery JSON format')
    }

    const combineImage = [...existingImage, ...galleryPaths]

    let parsedVariants: any[] = []

    try {
      parsedVariants = variants ? JSON.parse(variants) : []
    } catch {
      throw new AppError(400, 'Invalid variants JSON format')
    }

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
        volume,
        brand,
        image: combineImage,
        variants: {
          deleteMany: {},
          create: parsedVariants.map((v: any) => ({
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
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ msg: 'Product not found' })
    }
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// DELETE Product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        variants: true, // Include variants if they also have images
      },
    })

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' })
    }

    // Delete associated images from upload folder
    const uploadDir = path.join(__dirname, '..', 'uploads', 'products')

    if (product.image && Array.isArray(product.image)) {
      for (const imageUrl of product.image) {
        try {
          // Extract filename from URL
          const urlParts = imageUrl.split('/')
          const filename = urlParts[urlParts.length - 1]

          // Build the full file path
          const filePath = path.join(uploadDir, filename)

          // Check if file exists and delete it
          try {
            await fs.access(filePath)
            await fs.unlink(filePath)
            console.log(`Deleted image: ${filename}`)
          } catch (fsErr) {
            // File doesn't exist, skip it
            console.log(`Image not found: ${filename}`)
          }
        } catch (imgErr) {
          console.error(`Error deleting image ${imageUrl}:`, imgErr)
          // Continue with other images even if one fails
        }
      }
    }

    await prisma.product.delete({
      where: { id: Number(id) },
    })

    res.json({ msg: 'Product deleted' })
  } catch (err) {
    console.error('Error deleting product:', err)
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
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
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ msg: 'Video not found' })
    }
    res.status(500).json({ error: 'Failed to delete video' })
  }
})

// --- Categories ---
app.get('/api/categories', async (req, res) => {
  try {
    const { brand } = req.query
    const categories = await prisma.category.findMany({
      where: brand ? { brand: String(brand) } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    res.json(categories)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

app.post(
  '/api/categories',
  asyncHandler(async (req, res) => {
    const { name, brand, displayName } = req.body
    const slug = `${brand.toLowerCase().replace(/\s+/g, '_')}_${slugify(name, {
      lower: true,
      replacement: '_',
    })}`

    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    })
    if (existingCategory) {
      throw new AppError(400, 'Category with this name already exists')
    }
    const newCat = await prisma.category.create({
      data: {
        name,
        slug,
        brand: brand.toLowerCase() || null,
        displayName: displayName || null,
      },
    })
    res.json(newCat)
  })
)

app.put(
  '/api/categories/:id',
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params
      const { name, brand, displayName } = req.body

      const catExist = await prisma.category.findUnique({
        where: { id: Number(id) },
      })

      if (!catExist) {
        throw new AppError(404, 'Category not found')
      }

      const slug = `${brand.toLowerCase().replace(/\s+/g, '_')}_${slugify(
        name,
        {
          lower: true,
          replacement: '_',
        }
      )}`
      if (slug !== catExist.slug) {
        const existingCategory = await prisma.category.findUnique({
          where: { slug },
        })
        if (existingCategory) {
          throw new AppError(400, 'Category with this name already exists')
        }
      }

      const updatedCategory = await prisma.category.update({
        where: { id: Number(id) },
        data: {
          name,
          slug,
          brand: brand || null,
          displayName: displayName || null,
        },
      })
      res.json(updatedCategory)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to fetch categories' })
    }
  })
)

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.category.delete({
      where: { id: Number(id) },
    })
    res.json({ msg: 'Category deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete category' })
  }
})

// if (process.env.NODE_ENV === 'production') {
//   app.get(/^(?!\/api).*$/, (req, res, next) => {
//     if (req.path.startsWith('/api/')) {
//       return res.status(404).json({ error: 'API route not found' })
//     }

//     // Serve index.html for all other routes (SPA)
//     res.sendFile(path.join(staticPath, 'index.html'))
//   })
// }

app.use(globalError)

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`)
  console.log(`📁 Serving static files from: ${staticPath}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)

  if (process.env.NODE_ENV === 'production') {
    console.log(`✅ Production mode enabled`)
  }
})
