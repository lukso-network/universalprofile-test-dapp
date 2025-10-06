import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

const resolveModule = name => {
  return path.resolve(__dirname, 'node_modules', name)
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['lukso.png', 'logo.png'],
      manifest: {
        name: 'Universal Profile Test dApp',
        short_name: 'UP Test dApp',
        description: 'Test dApp for LUKSO Universal Profiles',
        theme_color: '#fe005b',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      process: 'process/browser',
      util: resolveModule('util/'),
      http: resolveModule('stream-http'),
      https: resolveModule('https-browserify'),
      stream: resolveModule('stream-browserify'),
      buffer: resolveModule('buffer/'),
    },
    extensions: ['.ts', '.js', '.json', '.vue'],
  },
  esbuild: process.env.NODE_ENV === 'production' ? {} : undefined,
  define: {
    'import.meta.env.GRID_WIDGET_URL': JSON.stringify(
      process.env.NODE_ENV === 'production'
        ? 'https://widget-example.lukso.dev/'
        : 'http://localhost:4321'
    ),
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: {
        main: 'index.html',
        widget: 'widget.html',
      },
    },
  },
  base: process.env.PUBLIC_PATH || '/',
})
