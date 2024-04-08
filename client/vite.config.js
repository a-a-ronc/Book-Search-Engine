import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    open: true,
    proxy: {
      // Target requests to "/graphql" to your GraphQL server
      '/graphql': {
        target: 'http://localhost:3000', // Point to the server where Apollo Server is running
        secure: false,
        changeOrigin: true,
      }
    }
  }
});

