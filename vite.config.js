import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',
        emptyOutDir: false,

        rollupOptions: {
            input: [
                'src/js/index.js',
                'src/css/style.css'
            ],
            output: {
                entryFileNames: 'js/index.js',

                assetFileNames(asset) {
                    let extension = asset.name.split('.').at(1);
                    if (/css/i.test(extension)) {
                        return 'css/style.css';
                    }
                    return `${extension}/[name][extname]`;
                }
            }
        }
    }
});