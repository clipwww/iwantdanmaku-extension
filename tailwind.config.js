module.exports = {
  purge: {
    enabled: true,
    layers: ['components', 'utilities'],
    content: [
      './src/**/*.html',
      './src/**/*.vue',
    ]
  },
  theme: {
    extend: {
      lineHeight: {
        '0': 0
      }
    },
  },
  variants: {},
  plugins: [],
}
