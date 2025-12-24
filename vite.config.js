import {defineConfig} from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest.json'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [crx({ manifest })],
    publicDir: 'public',
    base: '',  // 使用相对路径，确保扩展离线可用
    build: {
        outDir: mode === 'production' ? 'dist' : 'dist-dev',
        emptyOutDir: true,
        target: 'es2015',
        minify: false
    },
    esbuild: {
        target: 'es2015'
    }
}))
