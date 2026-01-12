import { SiteSettings } from '../types'
import { api } from './apiInstance' // Your axios instance

export const DEFAULT_SETTINGS: SiteSettings = {
  phone: '012 999 996',
  email: 'chhaylyhh@online.com.kh',
  address:
    'ភូមិត្រពាំងថ្លឹង សង្កាត់ចោមចៅ ខណ្ឌពោធិ៍សែនជ័យ រាជធានីភ្នំពេញ ព្រះរាជាណាចក្រកម្ពុជា',
  mapUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.770519363063!2d104.8906643!3d11.5682859!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109519fe4077d69%3A0x20138e822e434660!2sPhnom%20Penh!5e0!3m2!1sen!2skh!4v1715000000000!5m2!1sen!2skh',
  facebookUrl: '#',
  youtubeUrl: '#',
}

export const getSettings = async (): Promise<SiteSettings> => {
  const { data } = await api.get<SiteSettings>('/settings')
  return data
}

export const saveSettings = async (
  settings: SiteSettings
): Promise<SiteSettings> => {
  const { data } = await api.put<SiteSettings>('/settings', settings)
  return data
}
