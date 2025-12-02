import { defineConfig, type ViteDevServer, type PreviewServer } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to suppress all localhost URL display
const suppressLocalhostUrl = () => {
  return {
    name: 'suppress-localhost-url',
    configureServer(server: ViteDevServer) {
      // Suppress URL printing
      server.printUrls = () => {
        // Completely suppress URL display
      }
      
      // Also intercept console.log to filter out localhost URLs
      const originalLog = console.log
      console.log = (...args: any[]) => {
        const message = args.join(' ')
        // Filter out any localhost URLs
        if (!message.includes('localhost:') && !message.includes('http://') && !message.includes('Local:')) {
          originalLog(...args)
        }
      }
    },
    configurePreviewServer(server: PreviewServer) {
      // Suppress URL printing
      server.printUrls = () => {
        // Completely suppress URL display
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), suppressLocalhostUrl()],
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    port: 5173,
    strictPort: false,
    host: 'localhost',
    open: false,
    fs: {
      // Allow serving files from the workspace root (for npm workspaces)
      allow: ['..'],
    },
  },
  preview: {
    port: 5173,
    strictPort: false,
    host: 'localhost',
    open: false,
  },
  logLevel: 'warn',
  optimizeDeps: {
    // Force Vite to resolve dependencies from workspace root
    force: true,
  },
})
