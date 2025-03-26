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
  }
}