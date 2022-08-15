const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
	name: 'react-design-editor',
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx', '.less'],
		plugins: [new TsconfigPathsPlugin()],
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html',
			title: 'React Design Editor',
			meta: {
				description: `React Design Editor has started to developed direct manipulation of editable design tools like Powerpoint, We've developed it with react.js, ant.design, fabric.js`,
			},
		}),
	],
	optimization: {
		emitOnErrors: true,
	},
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
						!isProduction && ['@babel/plugin-transform-react-jsx-source'],
						!isProduction && 'react-refresh/babel',
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
			{
				test: /\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: 'url-loader',
				options: {
					publicPath: './',
					name: 'fonts/[hash].[ext]',
					limit: 10000,
				},
			},
		],
	},
};
