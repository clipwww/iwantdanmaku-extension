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
    module: {
      rules: [{
        test: /\.(scss|sass)$/,
        use: [
          // 需要用到的 loader
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ]
      }]
    },
    plugins: [
      new MiniCssExtractPlugin({
        // 指定輸出位置
        // [name] 為上方進入點設定的 "名稱"
        filename: "./css/[name].css"
      })
    ]
  }
  
};
