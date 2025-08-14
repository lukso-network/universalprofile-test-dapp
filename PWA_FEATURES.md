# PWA Features

This app is now a Progressive Web App (PWA) with the following features:

## Installation
- **Install to Home Screen**: Users can install the app on their devices (mobile and desktop)
- **Install Prompt**: Smart install prompt that appears when appropriate
- **Dismissible Prompt**: Remembers user preference for 7 days if dismissed

## Offline Support
- **Service Worker**: Caches app assets for offline access
- **Workbox Integration**: Advanced caching strategies for optimal performance
- **Google Fonts Caching**: Fonts are cached for 1 year

## Update Management
- **Auto Update**: Service worker updates automatically when new version is deployed
- **Update Notification**: Users are notified when a new version is available
- **One-Click Update**: Simple reload button to apply updates

## Icons & Theming
- **App Icons**: 192x192 and 512x512 icons for all platforms
- **Theme Color**: LUKSO pink (#fe005b) for browser chrome
- **Apple Touch Icon**: Optimized for iOS devices
- **Maskable Icons**: Supports Android adaptive icons

## Configuration
- PWA configuration in `vite.config.ts`
- Install prompt component in `src/components/PwaInstallPrompt.vue`
- Icons in `public/pwa-*.png`

## Testing PWA Features
1. Build the app: `yarn build`
2. Preview locally: `yarn preview`
3. Open in Chrome/Edge and check for install icon in address bar
4. On mobile, use "Add to Home Screen" option

## Browser Support
- Chrome/Edge: Full support
- Firefox: Service worker support, limited install features
- Safari: Basic PWA support, some limitations on iOS