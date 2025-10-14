import {defineConfig} from 'vite'
import {resolve} from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [],
    root: 'src',
    publicDir: '../public',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: resolve(__dirname, 'src/index.html'),
            output: {
                entryFileNames: 'index.js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]'
            }
        },
        target: 'es2015',
        minify: false
    },
    esbuild: {
        target: 'es2015'
    }
})
