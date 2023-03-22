import { resolve } from 'path';
import { defineConfig } from 'vite';

const port = 5173;
const apiHost = process.env.API_HOST || `http://localhost:${port}`;

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      root: '.',
      build: {
        outDir: './serve'
      },
      resolve: {
        alias: {
          '@': resolve(__dirname, 'src'),
        },
      },
      server: {
          port: port,
          proxy: {
              '/api': apiHost,
          }
      }
    };
  } else {
    // command === 'build'
    return {
      root: '.',
      build: {
        lib: {
          entry: resolve(__dirname, 'src/main.ts'),
          name: 'FDC3WebPortal',
          fileName: 'main',
        },
        outDir: 'dist',
        emptyOutDir: false,
      },
      resolve: {
        alias: {
          '@': resolve(__dirname, 'src'),
        },
      },
    }
  }
})
