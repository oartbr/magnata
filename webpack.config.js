const path = require('path');

module.exports = {
  entry: './src/index.js', // Entry file
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'magnata.bundle.js', // Output file name
    library: 'Magnata', // Name of the global variable for UMD
    libraryTarget: 'umd', // Universal Module Definition
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
  },
};
