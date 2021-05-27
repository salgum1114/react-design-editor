const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const pkg = require('./package.json');

const plugins = [
	// 로더들에게 옵션을 넣어주는 플러그인
	new webpack.LoaderOptionsPlugin({
		minimize: true,
	}),
];
module.exports = {
	mode: 'production',
	entry: {
		[pkg.name]: ['@babel/polyfill', path.resolve(__dirname, 'src/canvas/index.tsx')],
		[`${pkg.name}.min`]: ['@babel/polyfill', path.resolve(__dirname, 'src/canvas/index.tsx')],
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
		library: `${pkg.name}.js`,
		libraryTarget: 'umd',
		umdNamedDefine: true,
		publicPath: './',
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx|tsx|ts)$/,
				loader: 'babel-loader?cacheDirectory',
				include: path.resolve(__dirname, 'src'),
				options: {
					presets: [
						['@babel/preset-env', { modules: false }],
						'@babel/preset-react',
						'@babel/preset-typescript',
					],
					plugins: [
						'@babel/plugin-transform-runtime',
						'@babel/plugin-syntax-dynamic-import',
						['@babel/plugin-proposal-decorators', { legacy: true }],
						'@babel/plugin-syntax-async-generators',
						['@babel/plugin-proposal-class-properties', { loose: false }],
						'@babel/plugin-proposal-object-rest-spread',
						'dynamic-import-webpack',
					],
				},
				exclude: /node_modules/,
			},
			{
				test: /\.(css|less)$/,
				use: ['style-loader', 'css-loader', 'less-loader'],
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
	resolve: {
		extensions: ['.ts', '.tsx', '.js', 'jsx'],
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				include: /\.min\.js$/,
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
};
