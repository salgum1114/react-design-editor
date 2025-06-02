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
		globalObject: 'this', // node/browser 호환성
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx|tsx|ts)$/,
				loader: 'babel-loader',
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
								allowDeclareFields: true,
							},
						],
					],
					plugins: [
						'@babel/plugin-transform-runtime',
						['@babel/plugin-proposal-class-properties', { loose: true }],
						['@babel/plugin-proposal-private-methods', { loose: true }],
						['@babel/plugin-proposal-private-property-in-object', { loose: true }],
						['@babel/plugin-proposal-decorators', { legacy: true }],
						['import', { libraryName: 'antd', style: true }],
					],
				},
				exclude: /node_modules/,
			},
			{
				test: /\.(css|less)$/,
				use: ['style-loader', 'css-loader', 'less-loader'],
			},
			{
				test: /\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
				type: 'asset',
				parser: { dataUrlCondition: { maxSize: 10 * 1024 } },
				generator: { filename: 'fonts/[hash][ext]' },
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				include: /\.min\.js$/,
				terserOptions: {
					ecma: 6,
					compress: { unused: true },
					mangle: true,
				},
			}),
		],
	},
};
