import React from 'react'

const Hero: React.FC = () => {
  return (
    <div className="relative bg-primary-900 overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="text-center md:text-left md:w-1/2">
          <div className="inline-block px-4 py-1.5 bg-primary-800 text-primary-200 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
            Trusted by 10,000+ Homes
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Pure Water, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-200">
              Delivered Daily.
            </span>
          </h1>
          <p className="text-primary-100 text-lg md:text-xl mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
            Experience the crisp taste of naturally alkaline water. Sourced from
            pristine springs and delivered straight to your door within 24
            hours.
          </p>
        </div>

        <div className="md:w-1/2 flex justify-center">
          {/* Mockup Image */}
          <div className="relative w-full max-w-md aspect-square bg-gradient-to-tr from-white/10 to-transparent rounded-full flex items-center justify-center border border-white/10 backdrop-blur-sm p-8">
            <img
              src="https://picsum.photos/id/400/500/500" // Generic nature/water image
              alt="Water Bottle Splash"
              className="w-full h-full object-cover rounded-full shadow-2xl ring-8 ring-white/5"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce duration-[3000ms]">
              <div className="text-center">
                <p className="text-xs text-slate-400 uppercase font-bold">
                  pH Level
                </p>
                <p className="text-xl font-bold text-primary-600">7.5+</p>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="text-center">
                <p className="text-xs text-slate-400 uppercase font-bold">
                  Minerals
                </p>
                <p className="text-xl font-bold text-primary-600">Rich</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
