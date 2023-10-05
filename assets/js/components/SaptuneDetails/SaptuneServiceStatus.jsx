import React from 'react';
import { find, get } from 'lodash';
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
const renderService = (serviceName, services) => {
  const currentService = find(services, { name: serviceName });
  const { enabled, active } = currentService;

  if (!enabled) {
    return <span>-</span>;
  }

  const text = `${enabled}/${active}`;
  const icon = get(servicesIcons, [serviceName, text], null);

  return (
    <div className="flex">
      {icon}
      <span className="ml-1">{text}</span>
    </div>
  );
};

function SaptuneServiceStatus({ serviceName, services }) {
  return <>{renderService(serviceName, services)}</>;
}
export default SaptuneServiceStatus;
