module.exports = {
  plugins: [
    require('postcss-easy-import')(),
    require('precss')({ autoprefixer: false })
  ]
};
