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
					presets: [
						/* 네가 쓰던 preset들 그대로 */
					],
					plugins: [
						/* 네가 쓰던 plugin들 그대로 */
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
