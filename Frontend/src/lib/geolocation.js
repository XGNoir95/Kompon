export const GEOLOCATION_REQUIRED_MESSAGE =
  'Location access is required for this feature. Please allow location permission in your browser or device settings, then try again.'

export function requestDeviceLocation(options = {}) {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.reject(new Error('Geolocation is not supported by your browser.'))
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      ...options,
    })
  })
}
