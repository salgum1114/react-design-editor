import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json';

const host = 'localhost';
const devPort = 4000;
const previewPort = 4001;

export default defineConfig(config => {
	const { command, mode } = config;
	const isLibraryBuild = mode === 'lib';
	const isBuild = command === 'build';

	return {
		base: isLibraryBuild ? '/' : isBuild ? './' : '/',
		publicDir: isLibraryBuild ? false : 'public',
		plugins: [
			react({ jsxRuntime: 'classic' }),
			...(!isLibraryBuild
				? [
						VitePWA({
							filename: 'sw.js',
							injectRegister: false,
							registerType: 'autoUpdate',
							manifest: false,
							workbox: {
								additionalManifestEntries: [{ url: 'index.html', revision: null }],
								cleanupOutdatedCaches: true,
								globPatterns: ['**/*.{js,css,html,ico,png,svg,json,txt,woff,woff2,ttf,eot}'],
								globIgnores: ['**/sw.js', '**/workbox-*.js'],
								maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
								navigateFallback: 'index.html',
								runtimeCaching: [
									{
										urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
										handler: 'CacheFirst',
										options: {
											cacheName: 'google-fonts-cache',
											cacheableResponse: {
												statuses: [0, 200],
											},
											expiration: {
												maxAgeSeconds: 60 * 60 * 24 * 365,
												maxEntries: 10,
											},
										},
									},
									{
										urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
										handler: 'CacheFirst',
										options: {
											cacheName: 'gstatic-fonts-cache',
											cacheableResponse: {
												statuses: [0, 200],
											},
											expiration: {
												maxAgeSeconds: 60 * 60 * 24 * 365,
												maxEntries: 10,
											},
										},
									},
								],
							},
						}),
					]
				: []),
		],
		server: {
			host,
			port: devPort,
			headers: {
				'X-Frame-Options': 'sameorigin',
			},
		},
		preview: {
			host,
			port: previewPort,
			headers: {
				'X-Frame-Options': 'sameorigin',
			},
		},
		build: isLibraryBuild
			? {
					lib: {
						entry: path.resolve(__dirname, 'src/canvas/index.tsx'),
						name: pkg.name,
						cssFileName: 'react-design-editor',
						fileName: (format: string) => `${pkg.name}.${format}.js`,
						formats: ['es', 'cjs', 'umd'],
					},
					outDir: 'dist',
					sourcemap: true,
					rollupOptions: {
						external: ['react', 'react-dom'],
						output: {
							globals: {
								react: 'React',
								'react-dom': 'ReactDOM',
							},
						},
					},
				}
			: {
					outDir: 'docs',
					sourcemap: true,
					rollupOptions: {
						input: path.resolve(__dirname, 'index.html'),
					},
				},
	};
});
