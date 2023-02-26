const port = 5173;
const apiHost = process.env.API_HOST || `http://localhost:${port}`;

module.exports = {
    root: '.',
    build: {
      outDir: './out'
    },
    server: {
        port: port,
        proxy: {
            '/api': apiHost,
        }
    }
  }

