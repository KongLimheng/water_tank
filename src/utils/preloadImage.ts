export const getBaseImage = (src: string) =>
  src.replace(/_(400|800|1600)\.(jpg|jpeg|png)$/i, '')

export const preloadImage = (src: string) => {
  if (navigator.connection?.saveData) return

  const base = getBaseImage(src)

  console.log(base)
  ;['_800.avif', '_800.webp', '_800.jpg'].forEach((ext) => {
    const img = new Image()
    img.src = `${base}${ext}`
  })
}
