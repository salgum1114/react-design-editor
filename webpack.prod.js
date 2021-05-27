const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

const baseConfig = require('./webpack.common.js');

const plugins = [
	new webpack.LoaderOptionsPlugin({
		minimize: true,
	}),
	new HtmlWebpackPlugin({
		filename: 'index.html',
		title: 'React Design Editor',
		meta: {
			description: `React Design Editor has started to developed direct manipulation of editable design tools like Powerpoint, We've developed it with react.js, ant.design, fabric.js`,
		},
	}),
	new WorkboxPlugin.GenerateSW({
		skipWaiting: true,
		clientsClaim: true,
		swDest: 'sw.js',
	}),
];
module.exports = merge(baseConfig, {
	mode: 'production',
	entry: {
		vendor: ['react', 'react-dom', 'lodash', 'fabric', 'antd'],
		app: ['@babel/polyfill', path.resolve(__dirname, 'src/index.tsx')],
	},
	output: {
		path: path.resolve(__dirname, 'docs'),
		filename: 'js/[name].[chunkhash:16].js',
		chunkFilename: 'js/[id].[chunkhash:16].js',
		publicPath: './',
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				cache: true,
				parallel: true,
				terserOptions: {
					warnings: false,
					compress: {
						warnings: false,
						unused: true,
					},
					ecma: 6,
					mangle: true,
					unused: true,
				},
				sourceMap: true,
			}),
		],
	},
	plugins,
});
