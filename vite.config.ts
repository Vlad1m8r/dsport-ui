import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@twa-dev/sdk': path.resolve(__dirname, 'src/lib/twa-sdk.ts'),
    },
  },
})
