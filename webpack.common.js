const path = require('path');

module.exports = {
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
                        'react-hot-loader/babel',
                        'dynamic-import-webpack',
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
        noEmitOnErrors: true,
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.ts', '.tsx', '.js', 'jsx'],
    },
    node: {
        net: 'empty',
        fs: 'empty',
        tls: 'empty',
    },
};
