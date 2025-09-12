import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL || 'http://localhost:3001')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      plugins: [
        visualizer({
          filename: 'dist/bundle-analysis.html',
          open: false,
          gzipSize: true
        }),
        VitePWA({
          registerType: 'autoUpdate',
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                  },
                }
              },
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'gstatic-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                  }
                }
              },
              {
                urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'images-cache',
                  expiration: {
                    maxEntries: 60,
                    maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
                  }
                }
              },
              {
                urlPattern: /^https:\/\/api\./i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'api-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 5 * 60 // 5 minutes for API responses
                  },
                }
              }
            ]
          },
          includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
          manifest: {
            name: 'Orbit Marketing Platform',
            short_name: 'Orbit MKT',
            description: 'AI-Powered Marketing Platform for Small Businesses',
            theme_color: '#3b82f6',
            background_color: '#ffffff',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            categories: ['business', 'productivity', 'marketing'],
            lang: 'es',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ],
            shortcuts: [
              {
                name: 'Dashboard',
                short_name: 'Panel',
                description: 'Ver panel de control',
                url: '/?page=dashboard',
                icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
              },
              {
                name: 'Generar Contenido',
                short_name: 'Contenido',
                description: 'Crear contenido con IA',
                url: '/?page=content',
                icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
              }
            ]
          }
        })
      ],
      build: {
        target: 'es2018',
        minify: 'terser',
        chunkSizeWarningLimit: 500,
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.logs in production
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.debug', 'console.trace'],
          },
          mangle: {
            safari10: true,
          },
        },
        rollupOptions: {
          treeshake: {
            moduleSideEffects: false,
            propertyReadSideEffects: false,
            tryCatchDeoptimization: false,
          },
          output: {
            manualChunks: (id) => {
              // Node modules vendor splitting
              if (id.includes('node_modules')) {
                // React core - smallest chunk
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'react-vendor';
                }
                
                // Heavy chart libraries - split separately
                if (id.includes('recharts')) {
                  return 'recharts-vendor';
                }
                if (id.includes('reactflow') || id.includes('@reactflow')) {
                  return 'reactflow-vendor';
                }
                
                // Animation and UI libraries
                if (id.includes('framer-motion')) {
                  return 'animation-vendor';
                }
                if (id.includes('lucide-react')) {
                  return 'icons-vendor';
                }
                
                // Google AI API
                if (id.includes('@google/genai')) {
                  return 'ai-vendor';
                }
                
                // Date/time utilities
                if (id.includes('date-fns') || id.includes('moment')) {
                  return 'date-vendor';
                }
                
                // Form libraries
                if (id.includes('react-hook-form') || id.includes('formik') || id.includes('@hookform')) {
                  return 'form-vendor';
                }
                
                // Utility libraries  
                if (id.includes('lodash') || id.includes('ramda') || id.includes('clsx')) {
                  return 'utility-vendor';
                }
                
                // Testing libraries (only in dev builds)
                if (id.includes('testing-library') || id.includes('jest')) {
                  return 'test-vendor';
                }
                
                // Zod validation library
                if (id.includes('zod')) {
                  return 'validation-vendor';
                }
                
                // Analytics libraries
                if (id.includes('@sentry') || id.includes('mixpanel') || id.includes('analytics')) {
                  return 'analytics-vendor';
                }
                
                // PWA and service worker related
                if (id.includes('workbox') || id.includes('vite-plugin-pwa')) {
                  return 'pwa-vendor';
                }
                
                // Other small vendor libraries
                return 'vendor';
              }
              
              // Application code splitting by feature
              if (id.includes('/src/')) {
                // AI-related code
                if (id.includes('/ai/') || id.includes('aiService') || id.includes('/store/aiContext')) {
                  return 'ai-features';
                }
                
                // Dashboard and analytics
                if (id.includes('/dashboard/') || id.includes('/components/features/dashboard/')) {
                  return 'dashboard-features';
                }
                
                // Calendar functionality
                if (id.includes('/calendar/') || id.includes('/components/features/calendar/')) {
                  return 'calendar-features';
                }
                
                // Customer management
                if (id.includes('/customers/') || id.includes('/components/features/customers/')) {
                  return 'customer-features';
                }
                
                // Content and assets
                if (id.includes('/content/') || id.includes('/assets/') || 
                    id.includes('/components/features/content/') || id.includes('/components/features/assets/')) {
                  return 'content-features';
                }
                
                // Systems and integrations
                if (id.includes('/systems/') || id.includes('/components/features/systems/') || 
                    id.includes('/integrations/')) {
                  return 'systems-features';
                }
                
                // Onboarding (heavy component)
                if (id.includes('/onboarding/')) {
                  return 'onboarding-features';
                }
                
                // Core app shell (layouts, shared components)
                if (id.includes('/layouts/') || id.includes('/ui/') || id.includes('/store/')) {
                  return 'app-shell';
                }
              }
              
              // Default chunk for everything else
              return 'main';
            }
          }
        }
      },
      // Security headers for production
      server: {
        headers: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
        }
      }
    };
});
