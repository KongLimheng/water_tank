import {
  AlertCircle,
  CheckCircle2,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { getSettings, saveSettings } from '../../services/settingsService'
import { SiteSettings } from '../../types'

// Define the shape of our form
interface BannerItem {
  name: string
  banner_image: string
  file?: File // Optional: used for new uploads before they become URLs
}

interface SettingsFormValues {
  phone: string
  email: string
  address: string
  mapUrl: string
  banners: BannerItem[]
}

export const SettingsView = () => {
  const [isLoading, setIsLoading] = useState(false)

  // 1. Setup React Hook Form
  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues>({
    defaultValues: {
      phone: '',
      email: '',
      address: '',
      mapUrl: '',
      banners: [{ name: 'Banner1' }],
    },
  })

  // 2. Setup Field Array for Banners
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'banners',
  })

  // Watch map URL for live preview and validation
  const watchedMapUrl = watch('mapUrl')

  // 3. Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getSettings()

        // Parse the banners from JSON (assuming API returns it mostly matching our shape)
        // If banners is null in DB, default to empty array
        const loadedBanners = (data.banners as unknown as BannerItem[]) || [
          { name: 'Banner1' },
        ]

        reset({
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          mapUrl: data.mapUrl || '',
          banners: loadedBanners,
        })
      } catch (error) {
        console.error('Failed to load settings', error)
        toast.error('Failed to load settings')
      }
    }
    loadData()
  }, [reset])

  // Helper: Extract URL from iframe tag
  const extractUrl = (input: string) => {
    if (!input) return ''
    const match = input.match(/src=["']([^"']+)["']/)
    return match && match[1] ? match[1] : input.trim()
  }

  // Helper: Map Validation
  const getMapValidationState = (url: string) => {
    const clean = extractUrl(url)
    if (!clean) return { status: 'empty', message: null }

    if (
      clean.includes('maps.app.goo.gl') ||
      (clean.includes('maps.google.com') && !clean.includes('embed'))
    ) {
      return {
        status: 'error',
        message:
          'This looks like a Share Link. Please use the "Embed a map" HTML.',
      }
    }
    if (!clean.includes('google.com/maps/embed')) {
      return {
        status: 'warning',
        message: 'Warning: This URL may not be a valid Google Maps Embed link.',
      }
    }
    return { status: 'valid', message: 'Valid Embed Link detected.' }
  }

  const mapValidation = getMapValidationState(watchedMapUrl)
  const previewMapUrl = extractUrl(watchedMapUrl)

  const handleBannerImageChange = (index: number, files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0]
      const previewUrl = URL.createObjectURL(file)

      const currentValues = getValues(`banners.${index}`)

      update(index, {
        ...currentValues,
        banner_image: previewUrl,
        file: file,
      })
    }
  }

  // 5. Submit Handler
  const onSubmit = async (data: SettingsFormValues) => {
    setIsLoading(true)
    try {
      const processedBanners = await Promise.all(
        data.banners.map(async (b: any) => {
          if (b.file) {
            // const uploadResult = await uploadService.upload(b.file)
            // return { name: b.name, banner_image: uploadResult.url }

            // For now, we just keep the local preview or the file name to simulate
            console.log(`Uploading file for ${b.name}...`)
            return { name: b.name, banner_image: b.banner_image, file: b.file } // In real app, replace this with server URL
          }
          // No new file, keep existing URL
          return { name: b.name, banner_image: b.banner_image, file: null }
        })
      )

      const cleanMapUrl = extractUrl(data.mapUrl)

      const payload = {
        ...data,
        mapUrl: cleanMapUrl,
        banners: processedBanners, // This will be saved as JSON in Prisma
      }

      await saveSettings(payload as unknown as SiteSettings)

      // Re-fetch or reset to ensure clean state
      reset({ ...data, mapUrl: cleanMapUrl, banners: processedBanners })
      toast.success('Settings saved successfully!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 p-1">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Site Settings</h2>
          <p className="text-slate-500 text-sm">
            Update contact information, map location, and homepage banners.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-8"
      >
        {/* --- Contact Info Section --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Phone size={20} className="text-primary-600" /> Contact Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  {...register('phone')}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  {...register('email')}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Address
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-3 top-3 text-slate-400"
                size={16}
              />
              <textarea
                {...register('address')}
                rows={2}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* --- Map Configuration Section --- */}
        <div className="space-y-4 pt-2">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Globe size={20} className="text-primary-600" /> Map Location
          </h3>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg mb-3 flex gap-2 items-start">
              <HelpCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">How to get the correct link:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>
                    Go to your location on <strong>Google Maps</strong>.
                  </li>
                  <li>
                    Click the <strong>Share</strong> button.
                  </li>
                  <li>
                    Select the <strong>Embed a map</strong> tab.
                  </li>
                  <li>
                    Click <strong>Copy HTML</strong> and paste it below.
                  </li>
                </ol>
              </div>
            </div>
            <div className="lg:col-span-1 space-y-3">
              <label className="block text-sm font-bold text-slate-700">
                Google Maps Embed Code
              </label>
              <textarea
                {...register('mapUrl')}
                rows={4}
                placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-mono text-xs ${
                  mapValidation.status === 'error'
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-200'
                }`}
              />

              {/* Validation Messages */}
              {mapValidation.status === 'error' && (
                <div className="text-red-600 text-xs flex items-center gap-1.5">
                  <AlertCircle size={14} /> {mapValidation.message}
                </div>
              )}
              {mapValidation.status === 'warning' && (
                <div className="text-amber-600 text-xs flex items-center gap-1.5">
                  <HelpCircle size={14} /> {mapValidation.message}
                </div>
              )}
              {mapValidation.status === 'valid' && (
                <div className="text-green-600 text-xs flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> {mapValidation.message}
                </div>
              )}
            </div>

            {/* Map Preview Box */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Live Preview
              </label>
              <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative shadow-inner">
                {previewMapUrl ? (
                  <iframe
                    src={previewMapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    title="Map Preview"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <MapPin size={24} className="opacity-20" />
                    <span className="text-xs">No map URL</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Banners Section --- */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon size={20} className="text-primary-600" /> Promotion
              Banners
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {fields.map((field, index) => {
              return (
                <div
                  key={field.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex gap-4 items-start animate-in slide-in-from-left-2"
                >
                  <div className="flex-col flex flex-1 gap-2">
                    {/* Inputs */}
                    <div className=" w-full space-y-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Banner Name
                        </label>
                        <input
                          {...register(`banners.${index}.name` as const, {
                            required: 'Name is required',
                          })}
                          placeholder="e.g. Summer Sale"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                        {errors.banners?.[index]?.name && (
                          <span className="text-red-500 text-xs">
                            {errors.banners[index]?.name?.message}
                          </span>
                        )}
                      </div>

                      {/* Hidden input to store the URL text (if manually editing or verifying) */}
                      <div className="hidden">
                        <input
                          {...register(
                            `banners.${index}.banner_image` as const
                          )}
                        />
                      </div>
                    </div>

                    {/* Image Preview / Upload */}
                    <div className="w-full h-40 shrink-0 bg-slate-200 rounded-lg overflow-hidden relative group border border-slate-300">
                      {field.banner_image ? (
                        <img
                          src={field.banner_image}
                          alt="Banner"
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">
                          <ImageIcon size={24} />
                        </div>
                      )}

                      {/* Hidden File Input + Overlay Label */}
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-xs font-medium">
                        <UploadCloud size={20} className="mb-1" />
                        <span>Change</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleBannerImageChange(index, e.target.files)
                          }
                        />
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition self-start md:self-center"
                    title="Remove Banner"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )
            })}

            {fields.length === 0 && (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm">
                No banners added yet.
              </div>
            )}
            {fields.length < 5 && (
              <button
                type="button"
                onClick={() => append({ name: '', banner_image: '' })}
                className=" text-xs font-bold text-primary-600 flex items-center gap-1 hover:underline justify-self-end"
              >
                <Plus size={14} /> Add Banner
              </button>
            )}
          </div>
        </div>

        {/* --- Save Button --- */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isLoading || !isDirty}
            className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span>
            ) : (
              <>
                <Save size={18} /> Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
