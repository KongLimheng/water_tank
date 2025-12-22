import { Edit, Trash2, UploadCloud } from 'lucide-react'
import React, { useState } from 'react'
import { Product } from '../types'

interface ImageDragDropProps {
  dragActive: boolean
  formData: Partial<Product>
  handleDrag: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => void
  setFormData: React.Dispatch<React.SetStateAction<Partial<Product>>>
}

const ImageDragDrop = ({ formData, setFormData }: ImageDragDropProps) => {
  const [dragActive, setDragActive] = useState(false)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const base64 = await handleFileUpload(e.dataTransfer.files[0])
      setFormData({ ...formData, image: base64 })
    }
  }

  const handleFileUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return (
    <>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-2 transition-all duration-200 text-center ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
        }`}
      >
        <input
          type="file"
          id="image-upload"
          className="hidden"
          accept="image/*"
          onChange={async (e) => {
            if (e.target.files?.[0]) {
              const base64 = await handleFileUpload(e.target.files[0])
              setFormData({ ...formData, image: base64 })
            }
          }}
        />

        {formData.image ? (
          <div className="relative group inline-block">
            <img
              src={formData.image}
              alt="Preview"
              className="h-48 w-auto object-contain rounded-lg shadow-sm"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2 backdrop-blur-sm">
              <label
                htmlFor="image-upload"
                className="cursor-pointer p-2 bg-white rounded-full text-slate-700 hover:bg-slate-100 shadow-lg transition-transform hover:scale-110"
              >
                <Edit size={20} />
              </label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, image: '' })}
                className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 shadow-lg transition-transform hover:scale-110"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ) : (
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center w-full h-full"
          >
            <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-4 shadow-sm">
              <UploadCloud className="text-slate-600" size={24} />
            </div>
            <p className="text-base text-slate-700 font-medium mb-1">
              <span className="text-primary-600 font-bold hover:underline">
                Click to upload
              </span>{' '}
              or drag and drop
            </p>
            <p className="text-xs text-slate-400">SVG, PNG, JPG</p>
          </label>
        )}
      </div>
    </>
  )
}

export default ImageDragDrop
