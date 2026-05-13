import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

console.log(process.cwd())

const resolveModule = name => {
  return path.resolve(__dirname, 'node_modules', name)
}

const gridWidgetUrl =
  process.env.GRID_WIDGET_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://widget-example.lukso.dev/'
    : 'http://localhost:4321')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      graphql: path.resolve(__dirname, 'src/shims/graphql.ts'),
      'porto/internal': path.resolve(__dirname, 'src/shims/portoInternal.ts'),
      porto: path.resolve(__dirname, 'src/shims/porto.ts'),
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
    'import.meta.env.GRID_WIDGET_URL': JSON.stringify(gridWidgetUrl),
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
