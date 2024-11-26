import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

console.log(process.cwd())

const resolveModule = name => {
  return path.resolve(__dirname, 'node_modules', name)
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
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
        ? 'https://grid-widget.lukso.network'
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
