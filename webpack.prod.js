const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

const baseConfig = require('./webpack.common.js');

const pathsToClean = [
    'js',
];
const cleanOptions = {
    root: path.resolve(__dirname, 'public'),
    verbose: true,
};
const plugins = [
    // 로더들에게 옵션을 넣어주는 플러그인
    new webpack.LoaderOptionsPlugin({
        minimize: true,
    }),
    // index.html 로 의존성 파일들 inject해주는 플러그인
    new HtmlWebpackPlugin({
        filename: 'index.html',
        title: 'React Design Editor',
    }),
    new WorkboxPlugin.InjectManifest({
        swSrc: './src/sw.js',
        swDest: 'sw.js',
    }),
    new CleanWebpackPlugin(pathsToClean, cleanOptions),
];
module.exports = merge(baseConfig, {
    mode: 'production',
    entry: {
        vendor: [
            'react',
            'react-dom',
            'lodash',
            'fabric',
        ],
        app: ['@babel/polyfill', path.resolve(__dirname, 'src/index.js')],
    },
    output: {
        // entry에 존재하는 app.js, vendor.js로 뽑혀 나온다.
        path: path.resolve(__dirname, 'public'),
        filename: 'js/[name].[chunkhash:16].js',
        chunkFilename: 'js/[id].[chunkhash:16].js',
        publicPath: './',
    },
    optimization: {
        minimizer: [
            // we specify a custom UglifyJsPlugin here to get source maps in production
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                uglifyOptions: {
                    warnings: false,
                    compress: {
                        warnings: false,
                        unused: true, // tree shaking(export된 모듈 중 사용하지 않는 모듈은 포함하지않음)
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
});
