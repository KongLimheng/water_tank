import {
  AlertCircle,
  CheckCircle2,
  Globe,
  HelpCircle,
  Mail,
  MapPin,
  Phone,
  Save,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { getSettings, saveSettings } from '../../services/settingsService'
import { SiteSettings } from '../../types'

export const SettingsView = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    const loadSetting = async () => {
      const data = await getSettings()
      setSettings(data)
      if (data.mapUrl) validateMapUrl(data.mapUrl)
    }
    loadSetting()
  }, [setSettings])

  // Helper: Extract just the URL from an iframe string or return the string itself
  const extractUrl = (input: string) => {
    if (!input) return ''
    // Regex to find src="..." or src='...'
    const match = input.match(/src=["']([^"']+)["']/)
    return match && match[1] ? match[1] : input.trim()
  }

  const validateMapUrl = (url: string) => {
    const clean = extractUrl(url)
    if (!clean) {
      setMapError(null)
      return
    }

    if (
      clean.includes('maps.app.goo.gl') ||
      (clean.includes('maps.google.com') && !clean.includes('embed'))
    ) {
      setMapError(
        'This looks like a Share Link. Please use the "Embed a map" HTML.'
      )
    } else if (!clean.includes('google.com/maps/embed')) {
      setMapError(
        'Warning: This URL may not be a valid Google Maps Embed link.'
      )
    } else {
      setMapError(null)
    }
  }

  const handleMapInput = (val: string) => {
    setSettings((prev) => (prev ? { ...prev, mapUrl: val } : null))
    validateMapUrl(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return
    setLoading(true)

    // Clean up the URL before saving
    const cleanMapUrl = extractUrl(settings.mapUrl)

    const final = { ...settings, mapUrl: cleanMapUrl }

    // Simulate network delay if needed, or just save
    await saveSettings(final)
    setSettings(final)
    setLoading(false)
    toast.success('Settings saved successfully!')
  }

  if (!settings) return null

  const previewUrl = extractUrl(settings.mapUrl)

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 p-1">
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
                    setSettings({ ...settings, email: e.target.value })
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
                  setSettings({ ...settings, address: e.target.value })
                }
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

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Google Maps Embed Code
            </label>

            {/* Instructions */}
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

            <textarea
              rows={5}
              value={settings.mapUrl}
              onChange={(e) => handleMapInput(e.target.value)}
              placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-mono text-xs ${
                mapError
                  ? 'border-red-300 bg-red-50 focus:border-red-500'
                  : 'border-slate-200 text-slate-600'
              }`}
            />

            {/* Error / Warning Message */}
            {mapError && (
              <div className="mt-2 text-red-600 text-xs flex items-center gap-1.5">
                <AlertCircle size={14} />
                {mapError}
              </div>
            )}

            {!mapError && previewUrl && (
              <div className="mt-2 text-green-600 text-xs flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                Valid Embed Link detected.
              </div>
            )}
          </div>

          {/* Map Preview */}
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Live Preview
            </span>
            <div className="w-full h-64 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative shadow-inner">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Map Preview"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <MapPin size={32} className="opacity-20" />
                  <span className="text-sm">No map URL provided</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Save Button --- */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-200 flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? (
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
