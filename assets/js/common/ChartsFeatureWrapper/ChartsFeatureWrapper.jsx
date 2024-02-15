import React from 'react';
import ChartsDisabledBox from '@common/ChartsDisabledBox';

function ChartsFeatureWrapper({ children, chartsEnabled }) {
  if (!chartsEnabled) return <ChartsDisabledBox />;
  return children;
}

export default ChartsFeatureWrapper;
