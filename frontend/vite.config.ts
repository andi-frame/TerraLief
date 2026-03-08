import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["terralief.byhan.id", "localhost", "127.0.0.1", "0.0.0.0", "::1"],
    port: 5173,
    host: "0.0.0.0",
  }
})
