const { merge } = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const baseConfig = require('./webpack.common.js');

/** @type {import('webpack').Configuration} */
module.exports = merge(baseConfig, {
	mode: 'production',
	entry: {
		app: ['core-js/stable', path.resolve(__dirname, 'src/index.tsx')],
	},
	output: {
		path: path.resolve(__dirname, 'docs'),
		filename: 'js/[name].[contenthash].js',
		chunkFilename: 'js/[id].[contenthash].js',
		publicPath: './',
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html',
			title: 'React Design Editor',
			meta: {
				description: 'React Design Editor with direct manipulation like PowerPoint',
			},
		}),
		new WorkboxPlugin.GenerateSW({
			skipWaiting: true,
			clientsClaim: true,
			swDest: 'sw.js',
		}),
	],
});
