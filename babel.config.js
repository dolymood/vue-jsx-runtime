/* istanbul ignore next */
module.exports = {
  presets: [
    '@babel/preset-env',
  ],
  plugins: [
    [
      '@babel/plugin-transform-react-jsx',
      {
        throwIfNamespace: false, // defaults to true
        runtime: 'automatic', // defaults to classic
        importSource: 'vue' // defaults to react
      }
    ],
  ],
};
