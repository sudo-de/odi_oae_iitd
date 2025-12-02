import { defineConfig, type ViteDevServer, type PreviewServer } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to suppress localhost URL display
const suppressLocalhostUrl = () => {
  return {
    name: 'suppress-localhost-url',
    configureServer(server: ViteDevServer) {
      server.printUrls = () => {
        // Suppress the URL printing
      }
    },
    configurePreviewServer(server: PreviewServer) {
      server.printUrls = () => {
        // Suppress the URL printing
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({

  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  // MOST IMPORTANT FOR GITHUB PAGES
  base: '/odi_oae_iitd/',           // ←←←← Matches repository: sudo-de/odi_oae_iitd
  // If your repo is https://github.com/sudo-de/odi_oae_iitd → use '/odi_oae_iitd/'
  // If it's a user/org page (username.github.io) → use '/' only
  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
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
