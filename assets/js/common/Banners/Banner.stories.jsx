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
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'info' },
      },
    },
    iconSize: {
      description: 'The size of the icon in the banner',
      control: { type: 'radio' },
      options: ['s', 'm', 'l', 'xl', 'xxl', 16, 24, 32, 48, 64],
      table: {
        type: { summary: 'string|number' },
        defaultValue: { summary: 'm' },
      },
    },
    truncate: {
      description: 'Whether to truncate the banner text',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: true },
      },
    },
  },
};

export const Default = {
  args: {
    children: 'Banner content',
  },
};

export const WithTruncatedContent = {
  args: {
    children: faker.lorem.sentences(20),
    truncate: true,
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
