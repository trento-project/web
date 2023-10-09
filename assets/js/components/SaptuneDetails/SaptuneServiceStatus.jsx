import React from 'react';
import { get } from 'lodash';
import HealthIcon from '@components/Health/HealthIcon';

const servicesIcons = {
  saptune: {
    'enabled/active': <HealthIcon health="passing" />,
    'enabled/inactive': <HealthIcon health="warning" />,
    'disabled/active': <HealthIcon health="warning" />,
    'disabled/inactive': <HealthIcon health="critical" />,
  },
  sapconf: {
    'enabled/active': <HealthIcon health="critical" />,
    'enabled/inactive': <HealthIcon health="warning" />,
    'disabled/active': <HealthIcon health="critical" />,
    'disabled/inactive': <HealthIcon health="passing" />,
  },
  tuned: {
    'enabled/active': <HealthIcon health="warning" />,
    'enabled/inactive': <HealthIcon health="warning" />,
    'disabled/active': <HealthIcon health="warning" />,
    'disabled/inactive': <HealthIcon health="passing" />,
  },
};

function SaptuneServiceStatus({ serviceName, enabled, active }) {
  if (!enabled) {
    return <span>-</span>;
  }

  const status = `${enabled}/${active}`;
  const icon = get(servicesIcons, [serviceName, status], null);

  return (
    <div className="flex">
      {icon}
      <span className="ml-1">{status}</span>
    </div>
  );
}
export default SaptuneServiceStatus;
