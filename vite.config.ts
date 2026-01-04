import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const isBuild = mode === 'build'
  // Load env file based on `mode`
  const env = loadEnv(mode, process.cwd(), '')
  return {
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:5000', // Your backend server
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
        '@server': path.resolve(__dirname, './server'),
        '@components': path.resolve(__dirname, './components'),
        '@lib': path.resolve(__dirname, './lib'),
        '@services': path.resolve(__dirname, './services'),
      },
    },

    // Environment variables
    define: {
      'process.env.NODE_ENV': JSON.stringify(
        mode === 'prod' ? 'production' : 'development'
      ),
      'import.meta.env.MODE': JSON.stringify(mode),
    },

    build: {
      outDir: 'dist', // This is where Vite builds to
      emptyOutDir: true, // Clean before each build
      sourcemap: mode !== 'prod', // No sourcemaps in production

      // Minification
      minify: mode === 'prod' ? 'terser' : 'esbuild',
      terserOptions:
        mode === 'prod'
          ? {
              compress: {
                drop_console: true,
                drop_debugger: true,
              },
            }
          : undefined,

      rollupOptions: {
        output: {
          // manualChunks: (id) => {
          //   if (id.includes('node_modules')) {
          //     if (id.includes('react') || id.includes('react-dom')) {
          //       return 'vendor-react'
          //     }
          //     if (id.includes('@prisma') || id.includes('prisma')) {
          //       return 'vendor-prisma'
          //     }
          //     return 'vendor'
          //   }
          // },
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['lucide-react'],
            'prisma-vendor': ['@prisma/client', '@prisma/adapter-pg'],
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
    },
  }
})
