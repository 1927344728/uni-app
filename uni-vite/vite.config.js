import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig(async ({ mode }) => {
  const selfsigned = (await import('selfsigned')).default
  const attrs = [
    { name: 'commonName', value: 'localhost' }
  ]
  const pems = selfsigned.generate(attrs, { days: 365 })
  const env = loadEnv(mode, process.cwd())
  const protocol = env.VITE_SERVER_PROTOCOL
  return {
    plugins: [uni()],
    server: {
      port: 9000,
      https: protocol === 'http' ? false : {
        key: pems.private,
        cert: pems.cert,
      },
    },
  }
})
