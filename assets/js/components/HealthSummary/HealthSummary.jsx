import classNames from 'classnames';
import React from 'react';
import HealthSummaryBox from './HealthSummaryBox';

const HealthSummary = ({
  passing,
  critical,
  warning,
  className,
  onFilterChange,
  activeFilters = {
    passing: false,
    critical: false,
    warning: false,
  },
}) => {
  return (
    <div
      className={classNames(
        className,
        'tn-health-container flex flex-row justify-between'
      )}
    >
      <HealthSummaryBox
        health="passing"
        value={passing}
        selected={activeFilters.passing}
        onClick={onFilterChange}
      />
      <HealthSummaryBox
        health="warning"
        value={warning}
        selected={activeFilters.warning}
        onClick={onFilterChange}
      />
      <HealthSummaryBox
        style={{ marginRight: 0 }}
        health="critical"
        selected={activeFilters.critical}
        onClick={onFilterChange}
        value={critical}
      />
    </div>
  );
};

export default HealthSummary;
