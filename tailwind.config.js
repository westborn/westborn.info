const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  purge: {
    content: ['./src/**/*.njk'],
    layers: ['base', 'components', 'utilities'],
    options: {
      whitelist: ['direct-link'],
    },
  },
  theme: {
    fontFamily: {
      sans: defaultTheme.fontFamily.sans,
      serif: defaultTheme.fontFamily.serif,
      mono: ['Fira Code', ...defaultTheme.fontFamily.mono],
    },
    typography: {
      default: {
        css: {
          color: '#000000',
          '.direct-link': {
            color: '#bdc3c7',
            'text-decoration': 'none',
            '&:hover': {
              color: '#4a5568',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
  variants: {},
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
    defaultLineHeights: false,
    standardFontWeights: true,
  },
};
