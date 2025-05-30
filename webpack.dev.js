const { merge } = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseConfig = require('./webpack.common.js');

const devPort = 4000;
const host = 'localhost';

module.exports = merge(baseConfig, {
	mode: 'development',
	devtool: 'inline-source-map',
	entry: {
		app: [
			'core-js/stable',
			`webpack-dev-server/client?http://${host}:${devPort}`,
			'webpack/hot/only-dev-server',
			path.resolve(__dirname, 'src/index.tsx'),
		],
	},
	output: {
		path: path.resolve(__dirname, 'public'),
		publicPath: '/',
		filename: '[name].[contenthash].js',
	},
	devServer: {
		port: devPort,
		host,
		static: {
			directory: path.join(__dirname, 'public'),
		},
		historyApiFallback: true,
		headers: { 'X-Frame-Options': 'sameorigin' },
		hot: true,
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html',
			title: 'React Design Editor',
		}),
	],
});
