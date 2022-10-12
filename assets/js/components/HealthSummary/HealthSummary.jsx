import React from 'react';
import HealthFilterButton from './HealthFilterButton';

const HealthSummary = ({
  passing,
  critical,
  warning,
  onFilterChange,
  activeFilters = {
    passing: false,
    critical: false,
    warning: false,
  },
}) => {
  return (
    <div className="tn-health-container flex flex-row justify-between">
      <HealthFilterButton
        health="passing"
        value={passing}
        selected={activeFilters.passing}
        onClick={onFilterChange}
      />
      <HealthFilterButton
        health="warning"
        selected={activeFilters.warning}
        onClick={onFilterChange}
        value={warning}
      />
      <HealthFilterButton
        onClick={onFilterChange}
        selected={activeFilters.critical}
        style={{ marginRight: 0 }}
        health="critical"
        value={critical}
      />
    </div>
  );
};

export default HealthSummary;
