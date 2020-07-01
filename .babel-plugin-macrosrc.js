module.exports = {
  styledComponents: {
    displayName: process.env.NODE_ENV !== 'production',
  },
  rules: [
    {
      test: /\.less$/,
      use: [
        {
          loader: 'style-loader',
        },
        {
          loader: 'css-loader', // translates CSS into CommonJS
        },
        {
          loader: 'less-loader', // compiles Less to CSS
        },
      ],
    },
  ],
};
