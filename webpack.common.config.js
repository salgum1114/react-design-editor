const path = require('path');

module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader?cacheDirectory',
                include: path.resolve(__dirname, 'src'),
                options: {
                    presets: [
                        ['es2015', { loose: true, modules: false }],
                        'stage-0',
                        'react',
                    ],
                    plugins: [
                        'syntax-async-functions',
                        'react-hot-loader/babel',
                        'syntax-dynamic-import',
                        'dynamic-import-webpack',
                        ['import', { libraryName: 'antd', style: 'css' }],
                        'transform-decorators-legacy',
                    ],
                },
                exclude: /node_modules/,
            },
            {
                test: /\.(css|less)$/,
                use: ['style-loader', 'css-loader?importLoaders=1', 'less-loader'],
            },
            {
                test: /\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader',
                options: {
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
    node: {
        net: 'empty',
        fs: 'empty',
        tls: 'empty',
    },
    resolve: {
        alias: {
            'ag-grid-root': path.resolve(__dirname, '/node_modules/ag-grid'),
        },
    },
};
