import React from 'react'

interface MenuSectionProps {
  title?: string
  items: {
    id: string
    label: string
    icon: React.ComponentType<{ size?: number | string }>
  }[]
  activeTab: string
  setActiveTab: (id: string) => void
}
const MenuSection = ({
  title,
  items,
  activeTab,
  setActiveTab,
}: MenuSectionProps) => {
  return (
    <div className="mb-6">
      <h3 className="px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors border-l-4 ${
              activeTab === item.id
                ? 'bg-primary-50 text-primary-600 border-primary-600'
                : 'text-slate-600 hover:bg-slate-50 border-transparent'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default MenuSection
