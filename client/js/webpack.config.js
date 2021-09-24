const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
  var result = {
    entry: env.build == "test" ? './test/index' : './src/index',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, env.build == "test" ? './test/dist' : './dist'),
      library: "test"
    },
   mode: env.dev ? 'development' : "production",
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".json"]
    },
    module:{
      rules:[
        {
          test: /.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: ['@babel/preset-env'],
              },
            }
          ],
        }
      ]
    }
  };
  if(env.dev) result.devtool = false;
  
  if(env.build=="test"){
    result.plugins = [
      new HtmlWebpackPlugin({
        template: './test/index.html',
        filename: 'index.html',
        inject: 'body',
      }),
      new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/.js/]),
    ];
    if(!env.dev) result.optimization = {
      minimize: true,
      minimizer: [
         new TerserPlugin(),
      ],
    }
  }

  return result;
};