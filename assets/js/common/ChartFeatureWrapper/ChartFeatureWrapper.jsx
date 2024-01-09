import React from 'react';
import ChartDisabledBox from '@common/ChartDisabledBox';

function ChartFeatureWrapper({ children }) {
  // eslint-disable-next-line no-undef
  if (!config.chartsEnabled) return <ChartDisabledBox />;
  return children;
}

export default ChartFeatureWrapper;
