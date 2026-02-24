# PWA Setup for JobTracker

## What's Been Implemented

### 1. Next.js PWA Integration
- Added `next-pwa` package
- Configured PWA in `next.config.mjs`
- No offline caching (as requested) - app always fetches fresh data

### 2. Web App Manifest
- Created `public/manifest.json` with:
  - App name: "JobTracker - Track Your Job Applications"
  - Short name: "JobTracker"
  - Standalone display mode (looks like native app)
  - Theme color: #3b82f6
  - Icon references for all required sizes
  - Categories: productivity, business, utilities

### 3. Service Worker
- Created `public/sw.js` with basic PWA registration
- No caching - pass-through mode only
- Supports installation but always fetches fresh data

### 4. iOS Meta Tags
- Added iOS-specific meta tags to `src/app/layout.tsx`:
  - apple-mobile-web-app-capable: yes
  - apple-mobile-web-app-status-bar-style: default
  - apple-mobile-web-app-title: JobTracker
  - apple-touch-icon link

### 5. Install Banner Component
- Created `src/components/PWAInstallBanner.tsx`:
  - Detects if app is already installed
  - Shows install prompt for Android (Chrome/Edge)
  - Shows instructions for iOS (Share → Add to Home Screen)
  - Remembers user dismiss decisions (localStorage)
  - Auto-hides after installation

## Required App Icons

You need to create and place these icons in the `public/` folder:

### Required Sizes (PNG format):
- `icon-72x72.png` (72x72px)
- `icon-96x96.png` (96x96px)
- `icon-128x128.png` (128x128px)
- `icon-144x144.png` (144x144px)
- `icon-152x152.png` (152x152px)
- `icon-192x192.png` (192x192px)
- `icon-384x384.png` (384x384px)
- `icon-512x512.png` (512x512px)
- `apple-touch-icon.png` (180x180px, recommended for iOS)

### Icon Guidelines:
- Use your app logo/brand
- Transparent background works best for iOS
- For Android, consider adding padding for the maskable icon
- Keep the design simple and recognizable at small sizes

### Quick Icon Generation:
You can use these online tools to generate all sizes from one image:
1. https://www.favicon-generator.org/
2. https://realfavicongenerator.net/
3. https://favicon.io/

## How Users Install

### Android (Chrome/Edge)
1. User visits your site in Chrome or Edge
2. After 5 seconds, install banner appears
3. User taps "Install"
4. App is added to home screen
5. App opens in standalone mode (like native app)

### iOS (Safari)
1. User visits your site in Safari
2. After 3 seconds, instruction banner appears
3. User taps Share button (􀈂)
4. User selects "Add to Home Screen"
5. User taps "Add" to confirm
6. App is added to home screen

### Desktop
1. User visits your site in Chrome/Edge
2. Address bar shows install icon (if eligible)
3. User clicks install icon
4. App is installed as desktop app

## Testing PWA

### Chrome DevTools (Desktop)
1. Open DevTools (F12)
2. Go to Application tab
3. Check "Service Workers" - should show registered SW
4. Check "Manifest" - should show your manifest.json
5. Check "Install" button in the Manifest section

### iOS Testing
1. Open Safari on iOS device
2. Visit your site
3. Tap Share → Add to Home Screen
4. Check if app opens in standalone mode

### Android Testing
1. Open Chrome on Android device
2. Visit your site
3. Wait for install banner (or check 3-dot menu)
4. Install and verify it works as standalone app

## Customization Options

### Splash Screen
To customize splash screen, update `public/manifest.json`:
```json
"splash_screen": {
  "image": "/splash-screen.png",
  "background_color": "#ffffff"
}
```

### Display Modes
- `standalone` (default): Looks like native app, no browser UI
- `minimal-ui`: Minimal browser UI
- `browser`: Normal browser tab

### Orientation Options
- `portrait-primary` (default): Portrait only
- `landscape-primary`: Landscape only
- `any`: Any orientation

## Building for Production

The PWA configuration is automatically applied during build:
```bash
npm run build
```

Service worker will be:
- Disabled in development mode
- Enabled in production mode
- Registered automatically when the app loads

## Troubleshooting

### Install banner not showing:
- Check if user already dismissed it (clear localStorage)
- Check if app is already installed (PWAInstallBanner checks this)
- Check manifest.json is accessible (visit /manifest.json)
- Check service worker is registered (DevTools → Application)

### Icons not showing:
- Verify all icon files exist in `public/` folder
- Check file names match exactly in manifest.json
- Verify images are PNG format

### iOS not showing Add to Home Screen:
- Check if running on actual iOS device (not simulator)
- Verify HTTPS is enabled (PWA requires HTTPS)
- Check apple-touch-icon exists in public folder

## Next Steps

1. ✅ Create app icons (see required sizes above)
2. ✅ Test on iOS and Android devices
3. ✅ Verify install prompts work correctly
4. ✅ Test all app features in standalone mode
5. ✅ Consider adding offline support if needed later
