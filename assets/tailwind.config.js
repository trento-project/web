// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

module.exports = {
  darkMode: 'class',
  content: ['./js/**/*.{js,jsx}', '../lib/*_web/**/*.*ex'],
  theme: {
    extend: {
      animation: {
        fade: 'fadeIn 0.5s ease-in-out',
      },
      keyframes: (_theme) => ({
        fadeIn: {
          '0%': { opacity: '0%' },
          '100%': { opacity: '100%' },
        },
      }),
      // Applies to every `prose` block — today only the AI Assistant's
      // markdown. Keeps GFM output on the Trento palette and drops the
      // backtick pseudo-elements the plugin wraps inline code in.
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            a: {
              color: theme('colors.jungle-green.900'),
            },
            code: {
              backgroundColor: theme('colors.gray.100'),
              borderRadius: theme('borderRadius.DEFAULT'),
              fontWeight: '400',
              padding: '0.125rem 0.3rem',
            },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
            },
          },
        },
      }),
      colors: {
        'pine-green': '#0C322C',
        'jungle-green': {
          100: '#E4F6EE',
          300: '#98DDBC',
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
  plugins: [require('@tailwindcss/typography')],
};
