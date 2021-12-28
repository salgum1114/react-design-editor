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
	module: {
		rules: [
			{
				test: /\.(js|jsx|tsx|ts)$/,
				loader: 'babel-loader?cacheDirectory',
				include: path.resolve(__dirname, 'src'),
				options: {
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
								allowDeclareFields: true,
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
				sourceMap: false,
				terserOptions: {
					warnings: false,
					compress: {
						warnings: false,
						unused: true, // tree shaking(export된 모듈 중 사용하지 않는 모듈은 포함하지않음)
					},
					ecma: 6,
					mangle: true,
					unused: true,
				},
			}),
		],
	},
	plugins,
};
