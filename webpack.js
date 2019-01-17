var path = require('path');

module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'CdnAssetsSwitch.[contenthash].js',
        library: 'CdnAssetsSwitch',
        libraryTarget: 'umd'
    },
    optimization: {
        minimize: true,
    }
};