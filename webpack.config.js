var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

var extractLess = new ExtractTextPlugin({ filename: '[name].css' })

module.exports = {
	context: path.resolve('./src'),
	devServer: {
		headers: { 'Access-Control-Allow-Origin': '*' }
	},
	devtool: 'eval',
	entry: { app: '.' },
	module: {
		rules: [
			{ test: /\.tsx?$/, loader: 'ts-loader' },
			{
				test: /\.less$/,
				use: extractLess.extract({
					use: [
						{
							loader: 'css-loader',
							options: { importLoaders: 1 }
						},
						{ loader: 'postcss-loader' },
						{ loader: 'less-loader' }
					],
					fallback: 'style-loader'
				})
			}
		]
	},
	output: {
		path: path.resolve('./build'),
		filename: '[name].js'
	},
	plugins: [
		new webpack.NoEmitOnErrorsPlugin(),
		extractLess
	],
	resolve: {
		extensions: ['.js', '.ts', '.tsx'],
		modules: [
			path.resolve('./src'),
			'node_modules'
		]
	},
	target: 'web'
}
