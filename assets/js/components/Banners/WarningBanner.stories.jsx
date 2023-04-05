import React from 'react';

import WarningBanner from './WarningBanner';

export default {
  title: 'WarningBanner',
  component: WarningBanner,
};

const warningText = 'DANGER DANGER!';

export function PopulatedWarningBanner() {
  return <WarningBanner>{warningText}</WarningBanner>;
}

export function EmptyWarningBanner() {
  return <WarningBanner />;
}
