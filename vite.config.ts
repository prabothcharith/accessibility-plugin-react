import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    react(),
    dts({ 
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx', 'src/main.tsx', 'src/App.tsx'],
      tsconfigPath: './tsconfig.build.json',
      rollupTypes: true
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'AccessibilityPlugin',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'framer-motion': 'FramerMotion',
          'lucide-react': 'LucideReact'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'style.css';
          }
          return assetInfo.name || 'assets/[name]-[hash][extname]';
        }
      }
    },
    cssCodeSplit: false
  }
})
