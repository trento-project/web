import React from 'react';

import HealthIcon from '@components/Health/HealthIcon';

function SaptuneTuningState({ state }) {
  switch (state) {
    case 'compliant':
      return 'Compliant';
    case 'not compliant':
      return (
        <div className="flex">
          <HealthIcon health="critical" />
          <span className="ml-1">Not compliant</span>
        </div>
      );
    case 'no tuning':
      return (
        <div className="flex">
          <HealthIcon health="warning" />
          <span className="ml-1">No tuning</span>
        </div>
      );
    default:
      return <span>-</span>;
  }
}

export default SaptuneTuningState;
