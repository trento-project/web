import { faker } from '@faker-js/faker';

import Banner from './Banner';

export default {
  title: 'Components/Banner',
  component: Banner,
  argTypes: {
    type: {
      description: 'The type of the banner',
      control: { type: 'radio' },
      options: ['info', 'success', 'warning', 'error'],
    },
    iconSize: {
      description: 'The size of the icon in the banner',
      control: { type: 'radio' },
      options: ['s', 'm', 'l', 'xl', 'xxl', 16, 24, 32, 48, 64],
    },
    truncate: {
      description: 'Whether to truncate the banner text',
      control: { type: 'boolean' },
    },
    children: {
      description: 'The text or content to display inside the banner',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    type: 'info',
    iconSize: 'm',
    truncate: true,
    children: 'Banner content',
  },
};

export const WithTruncatedContent = {
  args: {
    ...Default.args,
    children: faker.lorem.sentences(20),
    truncate: true,
  },
};

export const SuccessBanner = {
  args: {
    ...Default.args,
    type: 'success',
    children: 'SUCCESS',
  },
};

export const WarningBanner = {
  args: {
    ...Default.args,
    type: 'warning',
    children: 'WARNING',
  },
};

export const ErrorBanner = {
  args: {
    ...Default.args,
    type: 'error',
    children: 'ERROR',
  },
};
