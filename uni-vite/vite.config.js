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

  const isAppPlatform = () => (process.env.UNI_PLATFORM || '').startsWith('app')
  const isNvueCompiler = () => process.env.UNI_COMPILER === 'nvue'

  const fixIifeCodeSplittingForApp = () => {
    const disableInline = (output) => {
      const apply = (item) => {
        if (!item || typeof item !== 'object') return item
        item.inlineDynamicImports = false
      }
      if (Array.isArray(output)) output.forEach(apply)
      else apply(output)
    }

    return {
      name: 'fix-iife-code-splitting-for-uni-app',
      enforce: 'post',
      config(config) {
        if (!isAppPlatform()) return

        const rollupOptions = (config.build ??= {}).rollupOptions ??= {}

        // nvue 是另一次子构建：每个 .nvue 页必须打成独立 chunk，随后 esbuild
        // 写成 app-plus/pages/xxx.js。一旦 inlineDynamicImports，chunk 消失，
        // 真机表现为 navigateTo 成功、导航栏在、onLoad 不跑、页面空白。
        if (isNvueCompiler()) {
          const existing = rollupOptions.output || {}
          if (Array.isArray(existing)) {
            rollupOptions.output = existing.map((item) => ({
              ...item,
              inlineDynamicImports: false,
            }))
          } else {
            rollupOptions.output = {
              ...existing,
              inlineDynamicImports: false,
            }
          }
          return
        }

        // AppService 默认 iife。Rollup 一旦 code-splitting 就会报
        // Invalid value "iife" for option "output.format"。
        // 只对 vue 的 AppService 内联动态 import，绝不能套到 nvue 上。
        const existing = rollupOptions.output || {}
        const outputs = Array.isArray(existing) ? existing : [existing]
        const isIife = outputs.some((item) => item && item.format === 'iife')
        if (!isIife) return

        rollupOptions.output = {
          ...existing,
          inlineDynamicImports: true,
          manualChunks: undefined,
        }
      },
      configResolved(config) {
        if (!isAppPlatform() || !isNvueCompiler()) return
        disableInline(config.build.rollupOptions.output)
      },
      generateBundle(_, bundle) {
        if (!isAppPlatform() || !isNvueCompiler()) return
        const nvueChunks = Object.values(bundle).filter((chunk) => (
          chunk.type === 'chunk' &&
          typeof chunk.facadeModuleId === 'string' &&
          chunk.facadeModuleId.replace(/\\/g, '/').endsWith('.nvue')
        ))
        if (!nvueChunks.length) {
          throw new Error('[nvue] 页面 chunk 没有生成，App 打开 nvue 会空白。请检查 vite 是否把 nvue 动态 import 内联进了 app.js')
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
