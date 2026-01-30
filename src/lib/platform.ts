export const isIOS = (): boolean => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) || 
         // Detect iPad on iOS 13+ (which reports as Mac)
         (userAgent.includes('mac') && 'ontouchend' in document);
}; 