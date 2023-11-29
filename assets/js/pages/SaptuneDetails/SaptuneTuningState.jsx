import React from 'react';

import HealthIcon from '@pages/HealthIcon';

function SaptuneTuningState({ state }) {
  switch (state) {
    case 'compliant':
      return <span>Compliant</span>;
    case 'not compliant':
      return (
        <div className="flex">
          <HealthIcon health="critical" />
          <span className="ml-1">Not compliant</span>
        </div>
      );
    case 'not tuned':
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
