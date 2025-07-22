import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig(async () => {
  const selfsigned = (await import('selfsigned')).default
  const attrs = [{ name: 'commonName', value: 'localhost' }]
  const pems = selfsigned.generate(attrs, { days: 365 })

  return {
    plugins: [uni()],
    server: {
      port: 9000,
      https: {
        key: pems.private,
        cert: pems.cert,
      },
    },
  }
})
