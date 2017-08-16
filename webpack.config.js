const webpack = require('webpack');

// pass `env` properties on command line, e.g. `webpack --env.minified`
module.exports = function(env) {
  env = env || {};

  return {
    entry: './src/module.js',
    output: {
        filename: (env.minified ? 'dist/tangram.min.js' : 'dist/tangram.debug.js'),
        library: 'Tangram',
        libraryTarget: 'umd'
    },
    devtool: (env.minified ? '' : 'eval-source-map'), // this works for source maps in workers (!)
    module: {
      rules: [
        {
          // apply babel for ES6/etc.
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  // ['es2015']
                  ['es2015', { modules: false }] // for tree-shaking (needs uglify plugin below for prod build)
                ]
              }
            }
          ]
        },
        {
          // import shaders
          test: /\.glsl$/,
          use: 'raw-loader'
        }
      ]
    },
    plugins: env.minified && [
      new webpack.optimize.UglifyJsPlugin({
       mangle: true,
       compress: {
          conditionals: false // needed for tree-shaking on worker: why?
       }

       // alternate config to make tree-shaking work
       // mangle: {
       //  keep_fnames: true
       // },
       // compress: false,
     })
    ]
  }
}
