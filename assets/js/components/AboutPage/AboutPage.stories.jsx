import React from 'react';
import AboutPage from '.';

const fetchAboutPageData = () =>
  Promise.resolve({
    data: {
      flavor: 'Community',
      sles_subscriptions: '27',
      version: '1.2.0+git.dev310.1680767518.f5894f7c',
    },
  });

export default {
  title: 'AboutPage',
  component: AboutPage,

  args: {
    onFetch: fetchAboutPageData,
  },
};

export function Default(args) {
  return <AboutPage {...args} />;
}
