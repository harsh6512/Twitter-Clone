import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600, 
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
