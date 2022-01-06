module.exports = {
  content: ['./js/**/*.{js,jsx}', '../lib/*_web/**/*.*ex'],
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
        mint: '#90EBCD',
        persimmon: '#FE7C3F',
        fog: '#EFEFEF',
      },
    },
    fontFamily: {
      sans: ['Lato'],
    },
  },
  variants: {},
  plugins: [],
};
