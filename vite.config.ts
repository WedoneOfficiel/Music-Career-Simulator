import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Le dépôt est publié sous /Music-Career-Simulator/ sur GitHub Pages.
  base: '/Music-Career-Simulator/',
  plugins: [react()],
})