import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProd = mode === 'production';
  
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      historyApiFallback: true, // Redirect 404s to index.html in dev mode
    },
    build: {
      target: 'es2020', // Ensure we're targeting a compatible version
      rollupOptions: {
        // Use different entry points for dev and prod
        input: isProd 
          ? path.resolve(__dirname, 'index.html')
          : path.resolve(__dirname, 'index.html'),
        external: ['path', 'fs', 'crypto', 'os'] // Mark Node.js builtin modules as external
      }
    },
    // Ensure Firestore connection errors are handled properly
    optimizeDeps: {
      include: isProd ? ['firebase/firestore'] : []
    },
    // Configure preview server to handle SPA routing
    preview: {
      port: 5173,
      strictPort: true,
      historyApiFallback: true,
    }
  }
})
