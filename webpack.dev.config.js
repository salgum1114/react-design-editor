const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseConfig = require('./webpack.common.config.js');
const WorkboxPlugin = require('workbox-webpack-plugin');

const devPort = 8080;
const host = 'localhost';

module.exports = merge(baseConfig, {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
        bundle: [
            'babel-polyfill',
            'react-hot-loader/patch',
            `webpack-dev-server/client?http://${host}:${devPort}`,
            'webpack/hot/only-dev-server',
            path.resolve(__dirname, 'src/index.js'),
        ],
    },
    output: {
        path: path.resolve(__dirname, 'public'),
        publicPath: '/',
        filename: '[name].[hash:16].js',
        chunkFilename: '[id].[hash:16].js',
    },
    devServer: {
        inline: true,
        port: devPort,
        contentBase: path.resolve(__dirname, 'public'),
        hot: true,
        publicPath: '/',
        historyApiFallback: true,
        host,
        proxy: {
            '/api': {
                target: 'http://localhost',
            },
            '/api/ws': {
                target: 'ws://localhost',
                ws: true,
            },
        },
        headers: {
            'X-Frame-Options': 'sameorigin', // used iframe
        },
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(), // HMR을 사용하기 위한 플러그인
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: `${__dirname}/src/index.html`,
        }),
        new WorkboxPlugin.InjectManifest({
            swSrc: './src/sw.js',
            swDest: 'sw.js',
        }),
        new WorkboxPlugin.GenerateSW({
            swDest: 'sw.js',
            clientsClaim: true,
            skipWaiting: true,
        }),
    ],
});
