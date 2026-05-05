import React from 'react';
import { aboutFactory } from '@lib/test-utils/factories';
import AboutPage from '.';

const aboutData = aboutFactory.build();
const fetchAboutPageData = () =>
  Promise.resolve({
    data: aboutData,
  });

export default {
  title: 'Layouts/AboutPage',
  component: AboutPage,
  args: {
    onFetch: fetchAboutPageData,
  },
  argTypes: {
    onFetch: {
      description: 'Function to fetch the about page data',
      action: 'fetch',
    },
  },
};

export const Default = {
  args: {
    onFetch: fetchAboutPageData,
  },
};
