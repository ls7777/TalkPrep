import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  // 仅开发模式提供本机目录；生产构建不包含本机路径。
  define: {
    'import.meta.env.VITE_EDITOR_URL': JSON.stringify(command === 'serve'
      ? `vscode://file/${encodeURI(process.cwd().replaceAll('\\', '/'))}`
      : ''),
  },
  server: { proxy: { '/api': 'http://127.0.0.1:3001' } },
}))
