import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            if (!res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                status: 503,
                error: 'Service Unavailable',
                message: 'Backend server is starting up or unreachable on port 8080. Please retry in a few seconds.',
              }));
            }
          });
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
