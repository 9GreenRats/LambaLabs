import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const config = {
    plugins: [react()],
    server: {
      port: mode === 'dashboard' ? 3000 : 
            mode === 'botboard' ? 3002 : 
            mode === 'lambalabs' ? 4000 : 5173,
    },
  };

  return config;
});
