export const isDesktop = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = [
    'android',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
    'iemobile',
    'opera mini',
    'mobile',
  ]

  // Check for common keywords used in mobile user agents
  for (const keyword of mobileKeywords) {
    if (userAgent.indexOf(keyword) !== -1) {
      return false // If a mobile keyword is found, it's not a desktop
    }
  }

  // If no mobile keywords are found, it's likely a desktop
  return true
}
