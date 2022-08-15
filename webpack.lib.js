const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const pkg = require('./package.json');

module.exports = {
	mode: 'production',
	entry: {
		[pkg.name]: ['core-js/stable', path.resolve(__dirname, 'src/canvas/index.tsx')],
		[`${pkg.name}.min`]: ['core-js/stable', path.resolve(__dirname, 'src/canvas/index.tsx')],
	},
	externals: {
		react: 'react',
		'react-dom': 'react-dom',
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
		library: `${pkg.name}.js`,
		libraryTarget: 'umd',
		umdNamedDefine: true,
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
	module: {
		rules: [
			{
				test: /\.(js|jsx|tsx|ts)$/,
				loader: 'babel-loader',
				include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'packages')],
				exclude: [/node_modules/],
				options: {
					cacheDirectory: true,
					babelrc: false,
					presets: [
						[
							'@babel/preset-env',
							{
								modules: false,
								useBuiltIns: 'usage',
								corejs: 3,
								targets: { browsers: ['last 5 versions', 'ie >= 11'], node: 'current' },
							},
						],
						'@babel/preset-react',
						[
							'@babel/preset-typescript',
							{
								isTSX: true,
								allExtensions: true,
							},
						],
					],
					plugins: [
						'@babel/plugin-transform-runtime',
						['@babel/plugin-transform-typescript', { allowDeclareFields: true }],
						['@babel/plugin-proposal-class-properties', { loose: true }],
						['@babel/plugin-proposal-private-methods', { loose: true }],
						['@babel/plugin-proposal-decorators', { legacy: true }],
						['@babel/plugin-proposal-private-property-in-object', { loose: true }],
						'@babel/plugin-syntax-dynamic-import',
						'@babel/plugin-syntax-async-generators',
						'@babel/plugin-proposal-object-rest-spread',
						'@babel/plugin-transform-spread',
					].filter(Boolean),
				},
			},
			{
				test: /\.(css|less)$/,
				use: [
					'style-loader',
					'css-loader',
					{
						loader: 'less-loader',
						options: {
							lessOptions: {
								javascriptEnabled: true,
							},
						},
					},
				],
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js', 'jsx'],
	},
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
};
