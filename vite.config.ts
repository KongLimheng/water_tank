import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  const backendUrl = env.VITE_API_URL || 'http://localhost:5000'
  return {
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: backendUrl, // Your backend server
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/uploads': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
    plugins: [react()],

    resolve: {
      alias: {
        '.prisma/client/index-browser':
          './node_modules/.prisma/client/index-browser.js',
        '@': path.resolve(__dirname, './'),
        '@components': path.resolve(__dirname, './components'),
        '@lib': path.resolve(__dirname, './lib'),
        '@services': path.resolve(__dirname, './services'),
      },
    },

    define: {
      'process.env.NODE_ENV': JSON.stringify(
        isProduction ? 'production' : 'development'
      ),
      'import.meta.env.MODE': JSON.stringify(mode),
      // ADD THIS LINE:
      'process.env': {},
      process: { env: {} },
      global: 'window',
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: !isProduction,
      minify: isProduction ? 'terser' : 'esbuild',
      reportCompressedSize: true,
      terserOptions: isProduction
        ? {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.debug'],
            },
          }
        : undefined,

      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['lucide-react', 'react-hook-form'],
            'utils-vendor': ['axios'],
            // 'prisma-vendor': ['@prisma/client', '@prisma/adapter-pg'],
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? '')) {
              return 'assets/images/[name]-[hash][extname]'
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(name ?? '')) {
              return 'assets/fonts/[name]-[hash][extname]'
            }
            return 'assets/[ext]/[name]-[hash][extname]'
          },
        },
      },
    },
    css: {
      devSourcemap: true,
      modules: {
        localsConvention: 'camelCase',
      },
    },

    optimizeDeps: {
      include: ['react', 'react-dom'],
      // exclude: ['@prisma/client'],
    },
  }
})
