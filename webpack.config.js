const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally')

const projectTitle = require('./package.json').displayName

module.exports = {
  mode: 'development',

  entry: {
    app: [
      './src/js/index.js',
      './src/styles/app.scss'
    ]
  },

  devServer: {
    host: '0.0.0.0',
    port: 8080
  },

  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name]-[hash].js'
  },

  // Use 'cheap-module-source-map' for better CSS source maps, but slower builds
  devtool: 'cheap-module-eval-source-map',

  resolve: {
    alias: {
      './src': path.resolve(__dirname, 'src/')
    }
  },

  module: {
    rules: [
      { test: /\.json$/, type: 'json' },

      {
        test: /\.(gif|png|jpe?g)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name]-[hash].[ext]',
            outputPath: 'images/'
          }
        }]
      },

      {
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name]-[hash].[ext]',
            outputPath: 'sounds/'
          }
        }]
      },

      {
        test: /\.css|.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: true
            }
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true

            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              config: { path: 'postcss-config.js' }
            }
          }
        ]
      },

      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },

  plugins: [
    // Using a [hash] in filename breaks hmr
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new HtmlWebpackPlugin({
      title: projectTitle,
      favicon: './favicon.ico',
      template: 'index.html'
    }),
    new MergeIntoSingleFilePlugin({
      files: {
        'bundle.js': [
          path.resolve(__dirname, 'src/js/index.js'),
          path.resolve(__dirname, 'src/jam-index.js')
        ]
      }
    })
  ]
}
