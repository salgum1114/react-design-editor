const webpack = require('webpack');
const path = require('path');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

const baseConfig = require('./webpack.common.js');

module.exports = merge(baseConfig, {
	mode: 'production',
	entry: {
		vendor: ['react', 'react-dom', 'lodash', 'fabric', 'antd'],
		app: ['core-js/stable', path.resolve(__dirname, 'src/index.tsx')],
	},
	output: {
		path: path.resolve(__dirname, 'docs'),
		filename: 'js/[name].[chunkhash:16].js',
		chunkFilename: 'js/[id].[chunkhash:16].js',
		publicPath: './',
	},
	plugins: [
		new webpack.ProgressPlugin(),
		new webpack.LoaderOptionsPlugin({
			minimize: true,
		}),
		new WorkboxPlugin.GenerateSW({
			swDest: 'sw.js',
			skipWaiting: true,
			clientsClaim: true,
		}),
	],
	optimization: {
		minimize: true,
		splitChunks: {
			chunks: 'all',
		},
		minimizer: [
			new TerserPlugin({
				parallel: true,
				terserOptions: {
					warnings: false,
					sourceMap: false,
					compress: {
						warnings: false,
						unused: true,
					},
					ecma: 5,
					mangle: true,
				},
			}),
		],
	},
});
