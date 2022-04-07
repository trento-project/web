import React from 'react';
import HealthSummary from './HealthSummary';

export const ComponentHealthSummary = ({ data }) => {
  return (
    <div className="mb-8">
      <HealthSummary data={data} />
    </div>
  );
};
