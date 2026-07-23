const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const certificate = join(__dirname, 'certs', 'dev.izhao.com.cn+3.pem');
const privateKey = join(__dirname, 'certs', 'dev.izhao.com.cn+3-key.pem');

if (!process.env.EXPO_USE_HTTP && existsSync(certificate) && existsSync(privateKey)) {
  config.server = {
    ...config.server,
    tls: {
      cert: readFileSync(certificate),
      key: readFileSync(privateKey),
    },
  };
}

module.exports = config;
