import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600, // Increase the limit (default is 500)
  },
  server:{
    port:7000,proxy: {
			"/api": {
				target: "http://localhost:8000",
				changeOrigin: true,
			},
		},
  }
})
