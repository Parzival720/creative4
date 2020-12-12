module.exports = {
  disableHostCheck: true,
  proxy: {
    '^/api': {
      target: 'http://localhost:3005',
    },
  }
}
