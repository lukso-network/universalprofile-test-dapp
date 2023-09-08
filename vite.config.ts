import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

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
  },
  esbuild: process.env.NODE_ENV === 'production' ? {} : undefined,
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  base: process.env.PUBLIC_PATH || '/',
})
