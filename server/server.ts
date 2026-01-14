import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import SyncFs from 'fs'
import path from 'path'
import slugify from 'slugify'
import { fileURLToPath } from 'url'
import AppError from './lib/AppError.js'
import globalError, { notFoundHandler } from './lib/globalError.js'
import { asyncHandler, comparePassword } from './lib/password.js'
import { prisma } from './lib/prismaClient.js'
import { requestLogger } from './lib/requestLogger.js'
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
app.use(
  cors({
    origin: [
      'https://super-duper-spork-gpqrp6jq47php9jg-3000.app.github.dev',
      'http://localhost:3000',
    ],
  })
)
app.use(express.json({ limit: '50mb' }))
app.use(
  express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 10000 })
)
app.use(requestLogger)

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
app.get('/api/products/:brandId/:category', async (req, res) => {
  try {
    const { brandId, category } = req.params
    const products = await prisma.product.findMany({
      where: {
        category: {
          brandId: Number(brandId),
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

app.post('/api/products', upload.any(), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      categoryId,
      volume,
      variants,
      brand,
      type,
      diameter,
      group,
      height,
      length,
    } = req.body

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
    const baseUrl =
      process.env.NODE_ENV === 'development'
        ? `${req.protocol}://${req.get('host')}`
        : process.env.VITE_API_URL
    // Handle Images
    let mainImage = ''
    let galleryPaths: string[] = []
    let existingImage = req.body.existingImage

    if (files && files.length > 0) {
      // Construct full URLs
      const fileUrls = files.map((f) => `/uploads/products/${f.filename}`)
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
        height,
        type,
        group,
        diameter,
        length,
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
      type,
      diameter,
      height,
      group,
      length,
    } = req.body

    const currentProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
      select: { image: true },
    })

    if (!currentProduct) {
      return res.status(404).json({ msg: 'Product not found' })
    }

    let keptImages: string[] = []
    try {
      keptImages = existingGallery ? JSON.parse(existingGallery) : []
    } catch {
      throw new AppError(400, 'Invalid existingGallery JSON format')
    }

    const imagesToDelete = currentProduct.image.filter(
      (oldUrl) => !keptImages.includes(oldUrl)
    )

    imagesToDelete.forEach((imageUrl) => {
      try {
        const filename = imageUrl.split('/').pop()

        if (filename) {
          const filePath = path.join(__dirname, '../uploads/products', filename)

          if (SyncFs.existsSync(filePath)) {
            SyncFs.unlinkSync(filePath)
            console.log(`Deleted orphan image: ${filename}`)
          }
        }
      } catch (err) {
        console.error(`Failed to delete image file: ${imageUrl}`, err)
      }
    })

    const files = (req.files as Express.Multer.File[]) || []
    const baseUrl =
      process.env.NODE_ENV === 'development'
        ? `${req.protocol}://${req.get('host')}`
        : process.env.VITE_API_URL
    let galleryPaths: string[] = []

    if (files && files.length > 0) {
      // Construct full URLs
      const fileUrls = files.map((f) => `/uploads/products/${f.filename}`)
      galleryPaths = fileUrls
    }
    const finalImageList = [...keptImages, ...galleryPaths]
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
        image: finalImageList,
        type,
        diameter,
        height,
        group: group || '',
        length,
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
            SyncFs.accessSync(filePath)
            SyncFs.unlinkSync(filePath)
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
    const categories = await prisma.category.findMany({
      include: { brand: true },
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
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const { name, brandId, displayName, uploadType } = req.body

    const brand = await prisma.brand.findUnique({ where: { id: brandId } })
    if (!brand) throw new AppError(404, 'Brand not exists')

    const slug = `${brand.name.toLowerCase().replace(/\s+/g, '_')}_${slugify(
      name,
      {
        lower: true,
        replacement: '_',
      }
    )}`

    const baseUrl =
      process.env.NODE_ENV === 'development'
        ? `${req.protocol}://${req.get('host')}`
        : process.env.VITE_API_URL
    const imageUrl = req.file
      ? `/uploads/${uploadType}/${req.file.filename}`
      : null

    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    })
    if (existingCategory) {
      if (req.file) SyncFs.unlinkSync(req.file.path)
      throw new AppError(400, 'Category with this name already exists')
    }
    const newCat = await prisma.category.create({
      data: {
        name,
        slug,
        brandId: brandId ? Number(brandId) : null,
        displayName: displayName || null,
        image: imageUrl,
      },
      include: { brand: true },
    })
    res.json(newCat)
  })
)

app.put(
  '/api/categories/:id',
  upload.single('image'),
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { name, brandId, displayName, uploadType } = req.body

    const brand = await prisma.brand.findUnique({ where: { id: brandId } })
    if (!brand) throw new AppError(404, 'Brand not exists')

    const catExist = await prisma.category.findUnique({
      where: { id: Number(id) },
    })

    if (!catExist) throw new AppError(404, 'Category not found')
    // Handle Image Update
    const baseUrl =
      process.env.NODE_ENV === 'development'
        ? `${req.protocol}://${req.get('host')}`
        : process.env.VITE_API_URL

    let imageUrl = catExist.image

    if (req.file) {
      const uploadDir = path.join(__dirname, '..', 'uploads', uploadType)

      if (imageUrl) {
        // Extract filename from URL
        const urlParts = imageUrl.split('/')
        const filename = urlParts[urlParts.length - 1]

        // Build the full file path
        const oldPath = path.join(uploadDir, filename)

        if (SyncFs.existsSync(oldPath)) SyncFs.unlinkSync(oldPath)
      }
      // 2. Set new image path
      imageUrl = `/uploads/${uploadType}/${req.file.filename}`
    }

    const slug = `${brand.name.toLowerCase().replace(/\s+/g, '_')}_${slugify(
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
        if (req.file) SyncFs.unlinkSync(req.file.path)
        throw new AppError(400, 'Category with this name already exists')
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        name,
        slug,
        brandId: brandId ? Number(brandId) : null,
        displayName: displayName || null,
        image: imageUrl,
      },
      include: { brand: true },
    })
    res.json(updatedCategory)
  })
)

app.delete(
  '/api/categories/:id',
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params

      const catExist = await prisma.category.findUnique({
        where: { id: Number(id) },
      })

      if (!catExist) throw new AppError(404, 'Category not found')
      let imageUrl = catExist.image
      await prisma.category
        .delete({
          where: { id: Number(id) },
        })
        .then(() => {
          if (imageUrl) {
            const uploadDir = path.join(
              __dirname,
              '..',
              'uploads',
              'categories'
            )

            // Extract filename from URL
            const urlParts = imageUrl.split('/')
            const filename = urlParts[urlParts.length - 1]

            // Build the full file path
            const oldPath = path.join(uploadDir, filename)

            if (SyncFs.existsSync(oldPath)) SyncFs.unlinkSync(oldPath)
          }
        })
      res.json({ msg: 'Category deleted' })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to delete category' })
    }
  })
)

// ===========================================================================
// ===========================================================================

app.get('/api/brands', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } })
    res.json(brands)
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch brands' })
  }
})

app.post(
  '/api/brands',
  asyncHandler(async (req, res) => {
    const { name } = req.body
    const slug = slugify(name, { lower: true })

    const brand = await prisma.brand.create({
      data: { name, slug },
    })
    res.json(brand)
  })
)

app.put(
  '/api/brands/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { name } = req.body
    const current = await prisma.brand.findUnique({ where: { id: Number(id) } })
    if (!current) throw new AppError(404, 'Brand not found')

    const updated = await prisma.brand.update({
      where: { id: Number(id) },
      data: {
        name,
        slug: slugify(name, { lower: true }),
      },
    })
    res.json(updated)
  })
)

app.delete('/api/brands/:id', async (req, res) => {
  try {
    const { id } = req.params
    // Optional: Check if products depend on this brand before deleting?
    await prisma.brand.delete({ where: { id: Number(id) } })
    res.json({ msg: 'Brand deleted' })
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete brand' })
  }
})

// ===========================================================================
// ===========================================================================

app.get('/api/settings', async (req, res) => {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
    })

    if (!settings) {
      return res.json({
        phone: '',
        email: '',
        address: '',
        mapUrl: '',
        banners: [], // Default empty array
      })
    }
    res.json(settings)
  } catch (err) {
    console.error('Error fetching settings:', err)
    res.status(500).json({ error: 'Failed to fetch settings' })
  }
})

app.put('/api/settings', upload.array('banner_files'), async (req, res) => {
  try {
    const {
      phone,
      email,
      address,
      mapUrl,
      facebookUrl,
      youtubeUrl,
      banners_metadata,
    } = req.body

    const oldSettings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
    })

    // Multer puts the files in req.files
    const files = (req.files as Express.Multer.File[]) || []

    // Parse the metadata sent from client
    let finalBanners: any[] = []

    if (banners_metadata) {
      const metadata = JSON.parse(banners_metadata)
      let fileIndex = 0

      // Reconstruct the banners array
      finalBanners = metadata.map((item: any) => {
        if (item.isNewUpload) {
          // Grab the next available file from the multer array
          const file = files[fileIndex]
          fileIndex++

          if (file) {
            const publicUrl = `/uploads/banners/${file.filename}`
            return {
              name: item.name,
              banner_image: publicUrl,
            }
          }
        }

        // Return existing item
        return {
          name: item.name,
          banner_image: item.banner_image,
        }
      })
    }

    // ============================================================
    // 3. IMAGE DELETION
    // ============================================================
    if (
      oldSettings &&
      oldSettings.banners &&
      Array.isArray(oldSettings.banners)
    ) {
      const oldBanners = oldSettings.banners as any[]

      // A. Extract lists of URLs
      const oldUrls = oldBanners
        .map((b) => b.banner_image)
        .filter((url) => typeof url === 'string') // Type guard

      const newUrls = finalBanners
        .map((b) => b.banner_image)
        .filter((url) => typeof url === 'string')

      const urlsToDelete = oldUrls.filter((url) => !newUrls.includes(url))

      await Promise.all(
        urlsToDelete.map(async (url) => {
          // Security: Ensure we are only deleting files in our uploads folder
          if (url.startsWith('/uploads/banners/')) {
            try {
              // Resolve the absolute path on the server
              // Adjust 'public' based on where your static folder actually lives relative to this file
              const filePath = path.join(process.cwd(), url)

              // Check if file exists before trying to delete
              if (SyncFs.existsSync(filePath)) {
                SyncFs.unlinkSync(filePath)
                console.log(`[Cleanup] Deleted orphan image: ${filePath}`)
              }
            } catch (deleteErr) {
              console.error(
                `[Cleanup] Failed to delete file: ${url}`,
                deleteErr
              )
              // We log error but don't stop the request; the DB update is more important
            }
          }
        })
      )
    }
    // ============================================================
    // END DELETION LOGIC
    // ============================================================

    // Upsert to DB
    const updatedSettings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {
        phone,
        email,
        address,
        mapUrl,
        facebookUrl,
        youtubeUrl,
        banners: finalBanners, // Save the JSON array
      },
      create: {
        id: 1,
        phone: phone || '',
        email: email || '',
        address: address || '',
        mapUrl: mapUrl || '',
        facebookUrl: facebookUrl || '',
        youtubeUrl: youtubeUrl || '',
        banners: finalBanners,
      },
    })

    res.json(updatedSettings)
  } catch (err) {
    console.error('Error saving settings:', err)
    res.status(500).json({ error: 'Failed to save settings' })
  }
})

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../dist')
  app.use(express.static(frontendPath))

  app.get(/^(?!\/api).*$/, (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next()
    }

    // Serve index.html for all other routes (SPA)
    res.sendFile(path.join(frontendPath, 'index.html'))
  })
}

app.use(globalError)
app.use(notFoundHandler)

const server = app.listen(port, () => {
  console.log(`🚀 Server running on port http://localhost:${port}`)
  console.log(`📁 Serving static files from: ${staticPath}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)

  if (process.env.NODE_ENV === 'production') {
    console.log(`✅ Production mode enabled`)
  }
})

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`)

  server.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcing shutdown')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
