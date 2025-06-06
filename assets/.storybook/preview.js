import '../../priv/static/assets/app.css';

export default {
  parameters : {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  tags: ['autodocs', 'autodocs']
}