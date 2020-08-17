const MiniCssExtractPlugin = require("mini-css-extract-plugin");


module.exports = {
  pages: {
    popup: {
      entry: 'src/popup/index.ts',
      template: "public/index.html",
      filename: 'popup.html'
    },
  },
  configureWebpack: {
    entry: {
      content: './src/content/index.ts',
    },
    output: {
      filename: 'js/[name].js',
      chunkFilename: '[name].js'
    }
  }
  
};
