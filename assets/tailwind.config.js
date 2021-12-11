module.exports = {
  purge: ['./js/**/*.js', '../lib/*_web/**/*.*ex'],
  theme: {
    extend: {
      colors: {
        'pine-green': '#0C322C',
        'jungle-green': '#30BA78',
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
