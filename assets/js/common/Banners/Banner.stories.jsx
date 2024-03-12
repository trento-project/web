import Banner from './Banner';

export default {
  title: 'Components/Banner',
  component: Banner,
  argTypes: {
    type: {
      description: 'The type of the banner',
      control: { type: 'radio' },
      options: ['info', 'success', 'warning', 'error'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'info' },
      },
    },
  },
};

export const Default = {
  args: {
    children: 'Banner content',
  },
};

export const SuccessBanner = {
  args: {
    type: 'success',
    children: 'SUCCESS',
  },
};

export const WarningBanner = {
  args: {
    type: 'warning',
    children: 'WARNING',
  },
};

export const ErrorBanner = {
  args: {
    type: 'error',
    children: 'ERROR',
  },
};
