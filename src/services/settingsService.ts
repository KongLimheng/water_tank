import { SiteSettings } from '../types'
import { api } from './apiInstance' // Your axios instance

export const getSettings = async (): Promise<SiteSettings> => {
  const { data } = await api.get<SiteSettings>('/settings')
  return data
}

export const saveSettings = async (settings: any): Promise<SiteSettings> => {
  const formData = new FormData()

  // Append basic fields
  formData.append('phone', settings.phone || '')
  formData.append('email', settings.email || '')
  formData.append('address', settings.address || '')
  formData.append('mapUrl', settings.mapUrl || '')
  formData.append('facebookUrl', settings.facebookUrl || '')
  formData.append('youtubeUrl', settings.youtubeUrl || '')
  formData.append('uploadType', 'banners')

  if (settings.banners && Array.isArray(settings.banners)) {
    const bannerMetadata: any[] = []
    console.log(settings.banners, '==')
    settings.banners.forEach((banner: any, index: number) => {
      if (banner.file) {
        // This is a NEW upload
        // Append the file with a specific key.
        // We use a naming convention like 'banner_files' so multer can grab them.
        formData.append('banner_files', banner.file)

        // Push metadata saying "The file at this index corresponds to this banner"
        // Note: Multer will give us an array of files. The order *usually* matches,
        // but it's safer to rely on the fact that we're iterating.
        // However, standard FormData doesn't let us link a file to a specific JSON object easily.
        // STRATEGY: We will mark this banner as "needs_upload" in the metadata.
        bannerMetadata.push({
          name: banner.name,
          banner_image: null, // Server will fill this
          isNewUpload: true,
          originalIndex: index, // Track order
        })
      } else {
        // Existing banner, just keep the URL
        bannerMetadata.push({
          name: banner.name,
          banner_image: banner.banner_image,
          isNewUpload: false,
        })
      }
    })

    // Append the metadata JSON
    formData.append('banners_metadata', JSON.stringify(bannerMetadata))
  }

  // Send as Multipart
  const { data } = await api.put<SiteSettings>('/settings', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}
