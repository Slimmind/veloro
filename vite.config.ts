import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: 'autoUpdate',
			injectRegister: false,
			// `generateSW` сейчас падает при закрытии бандлера:
			// "Unfinished hook action(s) on exit: (terser) renderChunk".
			// Переходим на `injectManifest` и отключаем minify именно для SW сборки.
			strategies: 'injectManifest',
			srcDir: 'src',
			filename: 'sw.ts',

			pwaAssets: {
				disabled: false,
				config: true,
			},

			manifest: {
				name: 'VeloRo',
				short_name: 'veloro',
				description: 'convinient cycling',
				theme_color: '#2E8B56',
			},

			injectManifest: {
				minify: false,
			},

			devOptions: {
				enabled: true,
				navigateFallback: 'index.html',
				suppressWarnings: true,
				type: 'module',
			},
		}),
	],
});
