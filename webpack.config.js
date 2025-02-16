const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/index.js', // Entry file
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'magnata.bundle.js',         // for entry chunks
    chunkFilename: '[name].[chunkhash].js', // for non-entry (split) chunks
    library: 'Magnata',         // The name of the global variable.
    libraryTarget: 'window',     // Expose it as a property on the window object.
    globalObject: 'this', // Fix for UMD in Node.js
  },
  mode: 'production', // Use 'production' for minification
  module: {
    rules: [
      {
        test: /\.js$/, // Apply Babel to .js files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js'], // Automatically resolve these extensions
    fallback: {
      process: require.resolve('process/browser'),
      crypto: require.resolve('crypto-browserify'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      vm: require.resolve('vm-browserify'),
      stream: require.resolve('stream-browserify'),
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser', // This injects the polyfill wherever `process` is used.
    }),
  ],
};
