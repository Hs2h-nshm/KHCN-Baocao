import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config - build tĩnh, deploy Vercel (framework: Vite, output: dist)
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  build: { outDir: 'dist' }
})
