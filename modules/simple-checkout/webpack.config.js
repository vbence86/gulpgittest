var path = require('path');
var webpack = require('webpack');
module.exports = {
    context: path.join(__dirname, "./"),
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loaders: ['babel']
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            }
        ]
    },
    output: {
        filename: './public/bundle.js'
    },
    devtool: 'source-map',
    plugins: [
        //new webpack.optimize.UglifyJsPlugin({minimize: true})
    ]
};
