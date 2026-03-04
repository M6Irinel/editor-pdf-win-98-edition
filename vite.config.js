import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Serve per far caricare correttamente i file quando si apre index.html direttamente dal computer
  server: {
    port: 3000
  }
})
