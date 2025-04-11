import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'web', // 👉 บอก Vite ว่าให้เริ่มจากโฟลเดอร์ web
  build: {
    outDir: '../dist', // 👉 ออกไปที่โฟลเดอร์ dist ตามปกติ
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'web/index.html') // 👉 ชี้ให้รู้ว่า index.html อยู่ตรงไหน
      }
    }
  },
  server: {
    port: 3000
  }
})