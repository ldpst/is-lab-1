import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: '../src/main/resources/static',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080/is-lab-1',
      '/updates': {
        target: 'ws://localhost:8080/is-lab-1',
        ws: true,
      },
    },
  },
})
