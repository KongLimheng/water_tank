import CoverImg from '../public/cover.jpg'
const Hero: React.FC = () => {
  return (
    <div className="relative bg-primary-900 overflow-hidden">
      {/* Abstract Background Shapes */}
      <img
        src={CoverImg} // Generic nature/water image
        alt="Water Bottle Splash"
        className="w-full h-full object-fill shadow-2xl"
      />
    </div>
  )
}

export default Hero
