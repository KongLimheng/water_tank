import { Trash2, UploadCloud } from 'lucide-react'
import { useState } from 'react'

interface ImageDragDropProps {
  removeImage: (idx: number) => void
  handleFilesSelected: (e: FileList | null) => void
  previewUrls: string[]
  maxFiles?: number
}

const ImageDragDrop = ({
  handleFilesSelected,
  removeImage,
  previewUrls,
  maxFiles = 5,
}: ImageDragDropProps) => {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelection = (files: FileList | null) => {
    if (!files) return

    const currentCount = previewUrls.length
    const newFilesCount = files.length
    const totalAfterAdd = currentCount + newFilesCount
    if (totalAfterAdd > maxFiles) {
      setError(`You can only upload up to ${maxFiles} images.`)
    }

    handleFilesSelected(files)
  }
  return (
    <>
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : previewUrls.length >= maxFiles
            ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
            : 'border-slate-300 hover:bg-slate-50'
        }`}
        onDragEnter={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setDragActive(false)
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          if (e.dataTransfer.files) handleFileSelection(e.dataTransfer.files)
        }}
      >
        <input
          type="file"
          id="img-upload"
          className="hidden"
          multiple
          accept="image/*"
          disabled={previewUrls.length >= maxFiles}
          onChange={(e) => handleFileSelection(e.target.files)}
        />
        <label
          htmlFor="img-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <UploadCloud className="text-slate-400 mb-2" size={32} />

          <p className="text-sm text-slate-600 font-medium">
            {previewUrls.length >= maxFiles ? (
              <span>Maximum {maxFiles} images reached</span>
            ) : (
              <span>Click to upload or drag & drop</span>
            )}
          </p>
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {previewUrls.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-slate-700">
              Selected images ({previewUrls.length}/{maxFiles})
            </p>

            {previewUrls.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  // Remove all images logic would need to be added to parent component
                  // For now, this is just UI
                  setError(null)
                }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {previewUrls.map((url, i) => (
              <div
                key={i}
                className="relative w-20 h-20 rounded-lg overflow-hidden group border border-slate-200"
              >
                <img
                  src={url}
                  className="w-full h-full object-cover"
                  alt="preview"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="text-white" size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default ImageDragDrop
