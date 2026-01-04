import { Request } from 'express'
import fs from 'fs'
import multer from 'multer'
import path from 'path'

const upload = multer({
  // storage: multer.memoryStorage(),
  storage: multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
      const uploadType = req.body.uploadType || 'products'
      const uploadDir = `uploads/${uploadType}`

      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      cb(null, uploadDir)
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
      // Clean filename and create unique name
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      const originalName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')
      const nameWithoutExt = path.parse(originalName).name
      const ext = path.extname(originalName).toLowerCase()

      cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`)
    },
  }),

  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5, // Maximum number of files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only images are allowed'))
    }
    cb(null, true)
  },
})

export default upload
