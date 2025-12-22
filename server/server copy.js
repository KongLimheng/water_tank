import bcrypt from 'bcryptjs'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import path from 'path'
import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import { PrismaClient } from './generated/prisma'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 5000
const prisma = new PrismaClient()

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// --- Database Setup ---
const dbPath = path.resolve(__dirname, 'h2o.db')
const verboseSqlite = sqlite3.verbose()
const db = new verboseSqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err)
  } else {
    console.log('Connected to SQLite database at', dbPath)
    db.run('PRAGMA foreign_keys = ON') // Enable Foreign Key enforcement
  }
})

// Helper functions for Async/Await
const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err)
      else resolve(this)
    })
  })

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })

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

const initDb = async () => {
  try {
    // Create Products Table
    await run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            image TEXT,
            category TEXT,
            volume TEXT
        )`)

    // Create Variants Table
    await run(`CREATE TABLE IF NOT EXISTS variants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            name TEXT,
            price REAL,
            stock INTEGER DEFAULT 0,
            sku TEXT,
            image TEXT,
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
        )`)

    // Create Users Table
    await run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user'
        )`)

    // Check and Seed Products
    const count = await get('SELECT count(*) as count FROM products')
    if (count.count === 0) {
      console.log('Database empty. Seeding products...')
      for (const p of SEED_PRODUCTS) {
        const result = await run(
          `INSERT INTO products (name, description, price, image, category, volume) VALUES (?, ?, ?, ?, ?, ?)`,
          [p.name, p.description, p.price, p.image, p.category, p.volume]
        )
        const productId = result.lastID

        if (p.variants) {
          for (const v of p.variants) {
            await run(
              `INSERT INTO variants (product_id, name, price, stock, sku, image) VALUES (?, ?, ?, ?, ?, ?)`,
              [
                productId,
                v.name,
                v.price,
                v.stock,
                v.sku || null,
                v.image || null,
              ]
            )
          }
        }
      }
      console.log('Product seeding complete.')
    }

    // Seed Admin User with Encrypted Password
    const userCount = await get(
      "SELECT count(*) as count FROM users WHERE username = 'admin'"
    )
    if (userCount.count === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10)
      await run(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['admin', hashedPassword, 'admin']
      )
      console.log('Admin user seeded (admin/123456).')
    } else {
      // Optional: In a real scenario, you might want to handle migration of existing plain text passwords here.
      // For now, we assume if the user exists, they are set up correctly.
    }
  } catch (err) {
    console.error('Database initialization failed:', err)
  }
}

initDb()

// --- API Routes ---

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body
  try {
    // SQL Injection Protection: Using parameterized query (?) prevents injection here
    const user = await get('SELECT * FROM users WHERE username = ?', [username])

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Password Encryption: Compare provided password with stored hash
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

// GET All Products (with variants)
app.get('/api/products', async (req, res) => {
  try {
    const products = await all('SELECT * FROM products ORDER BY id DESC')
    const productsWithVariants = await Promise.all(
      products.map(async (p) => {
        const variants = await all(
          'SELECT * FROM variants WHERE product_id = ?',
          [p.id]
        )
        return { ...p, variants }
      })
    )
    res.json(productsWithVariants)
  } catch (err) {
    console.error('Error fetching products:', err)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// GET Single Product
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const product = await get('SELECT * FROM products WHERE id = ?', [id])

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' })
    }

    const variants = await all('SELECT * FROM variants WHERE product_id = ?', [
      id,
    ])
    res.json({ ...product, variants })
  } catch (err) {
    console.error('Error fetching product:', err)
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// CREATE Product (with variants)
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, image, category, volume, variants } =
      req.body

    if (!name || !price) {
      return res.status(400).json({ msg: 'Name and Price are required' })
    }

    // SQL Injection Protection: Parameterized queries used throughout
    const result = await run(
      `INSERT INTO products (name, description, price, image, category, volume) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || '',
        parseFloat(price),
        image || '',
        category || 'bottles',
        volume || null,
      ]
    )
    const productId = result.lastID

    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        await run(
          `INSERT INTO variants (product_id, name, price, stock, sku, image) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            productId,
            v.name,
            parseFloat(v.price),
            parseInt(v.stock) || 0,
            v.sku || null,
            v.image || null,
          ]
        )
      }
    }

    const newProduct = await get('SELECT * FROM products WHERE id = ?', [
      productId,
    ])
    const newVariants = await all(
      'SELECT * FROM variants WHERE product_id = ?',
      [productId]
    )

    res.json({ ...newProduct, variants: newVariants })
  } catch (err) {
    console.error('Error creating product:', err)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// UPDATE Product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, price, image, category, volume, variants } =
      req.body

    const existing = await get('SELECT id FROM products WHERE id = ?', [id])
    if (!existing) return res.status(404).json({ msg: 'Product not found' })

    await run(
      `UPDATE products SET name = ?, description = ?, price = ?, image = ?, category = ?, volume = ? WHERE id = ?`,
      [name, description, parseFloat(price), image, category, volume, id]
    )

    if (variants && Array.isArray(variants)) {
      await run('DELETE FROM variants WHERE product_id = ?', [id])
      for (const v of variants) {
        await run(
          `INSERT INTO variants (product_id, name, price, stock, sku, image) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            id,
            v.name,
            parseFloat(v.price),
            parseInt(v.stock) || 0,
            v.sku || null,
            v.image || null,
          ]
        )
      }
    }

    const updatedProduct = await get('SELECT * FROM products WHERE id = ?', [
      id,
    ])
    const updatedVariants = await all(
      'SELECT * FROM variants WHERE product_id = ?',
      [id]
    )

    res.json({ ...updatedProduct, variants: updatedVariants })
  } catch (err) {
    console.error('Error updating product:', err)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// DELETE Product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const existing = await get('SELECT id FROM products WHERE id = ?', [id])
    if (!existing) return res.status(404).json({ msg: 'Product not found' })

    await run('DELETE FROM products WHERE id = ?', [id])

    res.json({ msg: 'Product deleted' })
  } catch (err) {
    console.error('Error deleting product:', err)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

app.listen(port, () => {
  console.log(`Server running with SQLite on port ${port}`)
})
