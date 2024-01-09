import React from 'react';
import ChartsDisabledBox from '@common/ChartsDisabledBox';

function ChartsFeatureWrapper({ children }) {
  // eslint-disable-next-line no-undef
  if (!config.chartsEnabled) return <ChartsDisabledBox />;
  return children;
}

export default ChartsFeatureWrapper;
