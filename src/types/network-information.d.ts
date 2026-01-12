export {}

declare global {
  interface NetworkInformation {
    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
    saveData?: boolean
  }

  interface Navigator {
    connection?: NetworkInformation
    mozConnection?: NetworkInformation
    webkitConnection?: NetworkInformation
  }
}
