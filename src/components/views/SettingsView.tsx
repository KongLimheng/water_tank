import { Globe, Mail, MapPin, Phone, Save } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { getSettings, saveSettings } from '../../services/settingsService'
import { SiteSettings } from '../../types'

export const SettingsView = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setSettings(getSettings())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return
    setLoading(true)

    // Iframe extraction logic
    let cleanMapUrl = settings.mapUrl
    if (cleanMapUrl.includes('<iframe')) {
      const srcMatch = cleanMapUrl.match(/src="([^"]+)"/)
      if (srcMatch && srcMatch[1]) cleanMapUrl = srcMatch[1]
    }

    const final = { ...settings, mapUrl: cleanMapUrl }
    saveSettings(final)
    setSettings(final)
    setLoading(false)
    toast.success('Settings saved!')
  }

  // Helper to extract clean URL for preview
  const getPreviewUrl = (input: string) => {
    if (!input) return ''
    if (input.includes('<iframe')) {
      const srcMatch = input.match(/src="([^"]+)"/)
      return srcMatch && srcMatch[1] ? srcMatch[1] : ''
    }
    return input
  }
  if (!settings) return null

  return (
    <>
      <div className="w-100 space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Site Settings</h2>
            <p className="text-slate-500 text-sm">
              Update contact information and map location.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6"
        >
          {/* Contact Info */}
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
                    type="text"
                    value={settings.phone}
                    onChange={(e) =>
                      setSettings({ ...settings, phone: e.target.value })
                    }
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
                    type="text"
                    value={settings.email}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: e.target.value,
                      })
                    }
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
                  rows={2}
                  value={settings.address}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      address: e.target.value,
                    })
                  }
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Map Configuration */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Globe size={20} className="text-primary-600" /> Map Location
            </h3>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Google Maps Embed URL (or iframe tag)
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Go to Google Maps -&gt; Share -&gt; Embed a map. Copy the HTML
                and paste it here.
              </p>
              <textarea
                rows={4}
                value={settings.mapUrl}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    mapUrl: e.target.value,
                  })
                }
                placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-mono text-xs text-slate-600"
              />
            </div>

            {/* Map Preview */}
            <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Live Preview
              </span>
              <div className="w-full h-64 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 relative">
                {settings.mapUrl ? (
                  <iframe
                    src={getPreviewUrl(settings.mapUrl)}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Map Preview"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                    No map URL provided
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-200 flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <span className="animate-spin">...</span>
              ) : (
                <>
                  <Save size={18} /> Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
