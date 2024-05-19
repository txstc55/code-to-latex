// vue.config.js
module.exports = {
  configureWebpack: {
    resolve: {
      fallback: {
        fs: false,
        path: false,
      },
    },
  },
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === "production" ? "/code-to-latex/" : "/",
};
