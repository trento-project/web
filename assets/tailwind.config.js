const Color = require('color')
const alpha = (clr, val) => Color(clr).alpha(val).rgb().string()
const lighten = (clr, val) => Color(clr).lighten(val).rgb().string()
const darken = (clr, val) => Color(clr).darken(val).rgb().string()

module.exports = {
  purge: ['./js/**/*.js', '../lib/*_web/**/*.*ex'],
  theme: {
    extend: {
      colors: {
        'pine-green': '#0C322C',
        'jungle-green': {
          100: '#E4F6EE',
          500: '#30BA78',
          900: '#0E7E3C',
        },
        'midnight-blue': '#192072',
        'waterhole-blue': '#2453FF',
        'mint': '#90EBCD',
        'persimmon': '#FE7C3F',
        'fog': '#EFEFEF',
      },
    },
    fontFamily: {
      sans: ['Lato'],
    },
  },
  variants: {},
  plugins: [],
};
