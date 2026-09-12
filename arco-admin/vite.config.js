import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const DEV_SSL_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../ssl/dev.izhao.com.cn_nginx',
);

function loadDevHttpsOptions() {
  const keyPath = path.join(DEV_SSL_DIR, 'dev.izhao.com.cn.key');
  const certPath = path.join(DEV_SSL_DIR, 'dev.izhao.com.cn_bundle.crt');
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    throw new Error(`找不到本地 HTTPS 证书: ${keyPath} / ${certPath}`);
  }
  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
}

/** Vite base 为 /arco-admin/ 时，访问 /arco-admin 会提示缺尾斜杠；开发/预览时自动 302 过去。 */
function redirectBareBase() {
  return {
    name: 'redirect-bare-base',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (url === '/arco-admin') {
          res.statusCode = 302;
          res.setHeader('Location', '/arco-admin/');
          res.end();
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (url === '/arco-admin') {
          res.statusCode = 302;
          res.setHeader('Location', '/arco-admin/');
          res.end();
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_SERVER_HOST || 'https://dev.izhao.com.cn:9443';

  return {
    base: '/arco-admin/',
    plugins: [react(), redirectBareBase()],
    server: {
      host: '0.0.0.0',
      port: 9010,
      https: loadDevHttpsOptions()
    },
    preview: {
      host: '0.0.0.0',
      port: 9010,
      https: loadDevHttpsOptions(),
    },
  };
});
