import React from 'react';
import HealthSummaryBox from './HealthSummaryBox';

const any = (predicate, label) =>
  Object.keys(predicate).reduce((accumulator, key) => {
    if (accumulator) {
      return true;
    }
    return predicate[key] === label;
  }, false);

const getCounters = (data) => {
  const defaultCounter = { critical: 0, warning: 0, passing: 0, unknown: 0 };

  if (!data || 0 === data.length) {
    return defaultCounter;
  }

  return data.reduce((accumulator, element) => {
    if (any(element, 'critical')) {
      return { ...accumulator, critical: accumulator.critical + 1 };
    }

    if (any(element, 'warning')) {
      return { ...accumulator, warning: accumulator.warning + 1 };
    }

    if (any(element, 'unknown')) {
      return { ...accumulator, unknown: accumulator.unknown + 1 };
    }

    if (any(element, 'passing')) {
      return { ...accumulator, passing: accumulator.passing + 1 };
    }
    return accumulator;
  }, defaultCounter);
};

const HealthSummary = ({ data }) => {
  const { passing, warning, critical } = getCounters(data);

  return (
    <div className="tn-health-container flex flex-row justify-between">
      <HealthSummaryBox health="passing" value={passing} />
      <HealthSummaryBox health="warning" value={warning} />
      <HealthSummaryBox
        style={{ marginRight: 0 }}
        health="critical"
        value={critical}
      />
    </div>
  );
};

export default HealthSummary;
