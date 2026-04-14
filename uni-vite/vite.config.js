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

  const fixIifeCodeSplittingForApp = () => {
    return {
      name: 'fix-iife-code-splitting-for-uni-app',
      enforce: 'post',
      config(config) {
        // 背景：uni-app App 端的 AppService 默认用 iife 输出（uni 内部写死），
        // 但 Vite/Rollup 只要触发 code-splitting（比如 dynamic import、某些插件分包逻辑），
        // 就会报错：`Invalid value "iife" for option "output.format" ... not supported for code-splitting builds.`
        //
        // 解决思路：保持 iife（避免基座按 script 加载时报 `import ... outside a module` 的白屏），
        // 同时“禁用分包”让构建退化为单 chunk：inlineDynamicImports=true 且去掉 manualChunks。
        //
        // 为什么要 enforce:'post'：因为 uni 的插件会在更后面写 output.format / manualChunks / inlineDynamicImports，
        // 只有后置覆盖才能稳定生效。
        if (!(process.env.UNI_PLATFORM || '').startsWith('app')) return

        const output = (config.build ??= {}).rollupOptions ??= {}
        const existing = output.output || {}
        output.output = {
          ...existing,
          inlineDynamicImports: true,
          manualChunks: undefined,
        }
      },
    }
  }
  return {
    plugins: [uni(), fixIifeCodeSplittingForApp()],
    server: {
      port: 9000,
      https: protocol === 'http' ? false : {
        key: pems.private,
        cert: pems.cert,
      },
    },
  }
})
