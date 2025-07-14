module.exports = {
  transpileDependencies: ['@dcloudio/uni-ui'],
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          javascriptEnabled: true
        }
      },
      sass: {
        implementation: require('sass')
      }
    }
  },
  devServer: {
    port: 9000 // 修改为你想要的端口号，例如3000
  }
}