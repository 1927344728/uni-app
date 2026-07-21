const { existsSync } = require('node:fs');
const { join } = require('node:path');
const { spawn } = require('node:child_process');

const root = join(__dirname, '..');
const certificate = join(root, 'certs', 'dev.izhao.com.cn+3.pem');
const privateKey = join(root, 'certs', 'dev.izhao.com.cn+3-key.pem');
const expoCli = join(root, 'node_modules', 'expo', 'bin', 'cli');
const proxyCli = join(root, 'node_modules', 'local-ssl-proxy', 'build', 'main.js');

if (!existsSync(certificate) || !existsSync(privateKey)) {
  console.error('HTTPS certificate files are missing. Run: mkcert -install, then generate certificates in certs/.');
  process.exit(1);
}

const spawnOptions = { stdio: 'inherit' };
const expo = spawn(process.execPath, [expoCli, 'start', '--port', '9011', ...process.argv.slice(2)], spawnOptions);
const proxy = spawn(process.execPath, [proxyCli,
  '--source', '9000',
  '--target', '9011',
  '--cert', certificate,
  '--key', privateKey,
], spawnOptions);

const stop = () => {
  expo.kill();
  proxy.kill();
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
expo.on('exit', (code) => {
  proxy.kill();
  process.exit(code ?? 0);
});
proxy.on('exit', (code) => {
  expo.kill();
  process.exit(code ?? 0);
});
