const path = require('path');

module.exports = {
	module: {
		rules: [
			{
				test: /\.(js|jsx|tsx|ts)$/,
				loader: 'babel-loader',
				include: [path.resolve(__dirname, 'src')],
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
	optimization: {
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /node_modules/,
					chunks: 'initial',
					name: 'vendor',
					enforce: true,
				},
			},
		},
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
	},
};
