import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'local-api',
        configureServer(server) {
          server.middlewares.use('/api/create-preference', async (req, res) => {
            if (req.method === 'OPTIONS') {
              res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
              });
              res.end();
              return;
            }

            const accessToken = env.VITE_MERCADO_PAGO_ACCESS_TOKEN;
            if (!accessToken) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Access token not set in .env' }));
              return;
            }

            try {
              let body = '';
              req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
              req.on('end', async () => {
                const { origin } = JSON.parse(body || '{}');
                const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    items: [{
                      id: 'pro-plan',
                      title: 'Plano Pro - Cante Comigo',
                      description: 'Acesso ilimitado e downloads de MP3',
                      quantity: 1,
                      unit_price: 34.90,
                      currency_id: 'BRL',
                    }],
                    back_urls: {
                      success: origin || 'http://localhost:5173',
                      failure: origin || 'http://localhost:5173',
                      pending: origin || 'http://localhost:5173',
                    },
                    auto_return: 'approved',
                  }),
                });
                const data = await mpRes.json();
                res.writeHead(mpRes.status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
              });
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        },
      },
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      exclude: ['better-sqlite3', 'express'],
    },
    build: {
      rollupOptions: {
        external: ['better-sqlite3', 'express'],
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
