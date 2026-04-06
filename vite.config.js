import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/espn': {
        target: 'https://site.api.espn.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/espn/, ''),
        headers: { 'User-Agent': 'Mozilla/5.0' },
      },
      '/espn-web': {
        target: 'https://site.web.api.espn.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/espn-web/, ''),
        headers: { 'User-Agent': 'Mozilla/5.0' },
      },
    },
  },
})
