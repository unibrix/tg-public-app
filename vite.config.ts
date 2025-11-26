import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  // CRITICAL: Different base paths for dev vs production
  // Dev (npm run dev): '/' → http://localhost:5173/
  // Build (npm run build): '/repo-name/' → GitHub Pages
  // Change 'tma-react-starter' to your repo name when deploying
  base: command === 'serve' ? '/' : '/tma-react-starter/',
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
      },
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
    process.env.HTTPS && mkcert(),
  ],
  build: {
    target: 'esnext',
    minify: 'terser'
  },
  publicDir: './public',
  server: {
    host: true,
  },
}));
