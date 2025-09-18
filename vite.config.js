import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    // 修复 sockjs-client 的 global is not defined 错误
    global: 'globalThis',
  },
  server: {
    proxy: {
      // 字符串简写写法
      // '/users': 'http://localhost:8080',
      // '/chat': 'http://localhost:8080',

      // 选项写法，更灵活，特别是对于 WebSocket
      '/ws': {
        target: 'http://localhost:8080',
        ws: true, // 关键：开启 WebSocket 代理
      },
      // 也可以用一个通用规则匹配所有 API
      '/api': { // 假设你所有的 REST API 都有 /api 前缀
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})