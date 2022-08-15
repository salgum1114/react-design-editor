const { merge } = require('webpack-merge');
const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const baseConfig = require('./webpack.common.js');

const port = 4000;
const host = 'localhost';

module.exports = merge(baseConfig, {
	mode: 'development',
	devtool: 'inline-source-map',
	entry: {
		app: [
			'core-js/stable',
			`webpack-dev-server/client?http://${host}:${port}`,
			'webpack/hot/only-dev-server',
			path.resolve(__dirname, 'src/index.tsx'),
		],
	},
	output: {
		path: path.resolve(__dirname, 'public'),
		publicPath: '/',
		filename: '[name].[hash:16].js',
		chunkFilename: '[id].[hash:16].js',
	},
	devServer: {
		port,
		host,
		open: true,
		historyApiFallback: true,
		static: {
			publicPath: '/',
			directory: path.resolve(__dirname, 'public'),
		},
		client: {
			progress: false,
		},
		headers: {
			'X-Frame-Options': 'sameorigin',
		},
	},
	plugins: [new ReactRefreshWebpackPlugin()],
});
