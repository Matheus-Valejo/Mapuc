import { defineConfig } from 'vite';

export default defineConfig({
	base: 'https://pucmap.com/',
	publicDir: 'public',
	build: {
		lib: {
			entry: 'src/index.ts',
			formats: ['es'],
			fileName: () => 'mapuc.js',
		},
		outDir: 'dist/embed',
		emptyOutDir: true,
		rollupOptions: {
			output: {
				assetFileNames: 'assets/[name]-[hash][extname]',
			},
		},
	},
});
