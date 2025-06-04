import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import pkg from './package.json';

export default defineConfig({
	publicDir: false,
	plugins: [react()],
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/canvas/index.tsx'),
			name: pkg.name,
			fileName: format => `${pkg.name}.${format}.js`,
			formats: ['es', 'cjs', 'umd'],
		},
		rollupOptions: {
			external: ['react', 'react-dom'],
			output: {
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM',
				},
			},
		},
		sourcemap: true,
		minify: 'terser', // 기본 빌드에서 압축
	},
});
