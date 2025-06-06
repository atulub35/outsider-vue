// Plugins
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
// import Fonts from 'unplugin-fonts/vite' - Removed as we're using CDN
import Layouts from 'vite-plugin-vue-layouts-next'
import Vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueRouter(),
    Layouts(),
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    Components(),
    // Fonts plugin removed as we're using CDN
    AutoImport({
      imports: [
        'vue',
        VueRouterAutoImports,
        {
          'pinia': ['defineStore', 'storeToRefs'],
        },
      ],
      eslintrc: {
        enabled: true,
      },
      vueTemplate: true,
    }),
  ],
  optimizeDeps: {
    exclude: [
      'vuetify',
      'vue-router',
      'unplugin-vue-router/runtime',
      'unplugin-vue-router/data-loaders',
      'unplugin-vue-router/data-loaders/basic',
    ],
  },
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3002,
    host: '0.0.0.0',
  },
  preview: {
    port: process.env.PORT || 3002,
    host: '0.0.0.0',
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.herokuapp.com'
    ]
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: 'modern-compiler',
      },
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  build: {
    // Configure chunking strategy
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create a vendor chunk for node_modules
          if (id.includes('node_modules')) {
            if (id.includes('vuetify')) {
              return 'vendor-vuetify';
            } else if (id.includes('vue') || id.includes('router')) {
              return 'vendor-vue';
            } else {
              return 'vendor'; // Other dependencies
            }
          }
          
          // Create separate chunks for large views/pages
          if (id.includes('/views/') || id.includes('/pages/')) {
            if (id.includes('Login') || id.includes('Register')) {
              return 'auth';
            } else if (id.includes('Chat')) {
              return 'chat';
            } else if (id.includes('Image') || id.includes('AIImage')) {
              return 'image-gen';
            }
          }
        },
        // Limit chunk sizes
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // Set max chunk size for code splitting warnings
    chunkSizeWarningLimit: 600,
    // Enable sourcemaps for production
    sourcemap: false,
    // Minification options - use esbuild instead of terser to reduce memory usage
    minify: 'esbuild',
    // Reduce memory usage during build
    assetsInlineLimit: 4096, // 4kb
    emptyOutDir: true,
    // Use smaller hash function to reduce memory usage
    cssCodeSplit: true
  }
})
