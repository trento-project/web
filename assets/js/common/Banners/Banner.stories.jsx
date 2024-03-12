import React from 'react';

import Banner from './Banner';

export default {
  title: 'Components/Banner',
  component: Banner,
};

const warningText = 'DANGER DANGER!';

export function PopulatedBanner() {
  return <Banner>{warningText}</Banner>;
}

export function EmptyBanner() {
  return <Banner />;
}
