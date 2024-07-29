import React from 'react';
import classNames from 'classnames';
import { EOS_HEALING, EOS_PACKAGE_UPGRADE_OUTLINED } from 'eos-icons-react';
import { noop, gt, gte } from 'lodash';

import Loading from './Loading';
import SumaNotConfigured from './SumaNotConfigured';
import Indicator from './Indicator';

const containerClassNames = classNames(
  'flex',
  'items-center',
  'bg-white',
  'rounded-md',
  'px-8',
  'py-4',
  'gap-x-8',
  'shadow'
);

function AvailableSoftwareUpdates({
  className,
  settingsConfigured = false,
  loading,
  relevantPatches,
  upgradablePackages,
  errorMessage,
  tooltip,
  onBackToSettings = noop,
  onNavigateToPatches = noop,
  onNavigateToPackages = noop,
}) {
  if (loading) {
    return <Loading className={containerClassNames} />;
  }

  if (!settingsConfigured) {
    return (
      <SumaNotConfigured
        className={containerClassNames}
        onBackToSettings={onBackToSettings}
      />
    );
  }

  return (
    <div
      className={classNames(
        containerClassNames,
        'flex-row',
        'place-content-stretch',
        'w-full',
        'm-2',
        className
      )}
    >
      <p className="font-bold text-2xl grow-0">Available Software Updates</p>

      <Indicator
        title="Relevant Patches"
        critical={gt(relevantPatches, 0)}
        isError={relevantPatches === undefined}
        message={gte(relevantPatches, 0) ? relevantPatches : errorMessage}
        tooltip={tooltip}
        icon={<EOS_HEALING size="xl" />}
        onNavigate={onNavigateToPatches}
      />

      <Indicator
        title="Upgradable Packages"
        isError={upgradablePackages === undefined}
        message={gte(upgradablePackages, 0) ? upgradablePackages : errorMessage}
        tooltip={tooltip}
        icon={<EOS_PACKAGE_UPGRADE_OUTLINED size="xl" />}
        onNavigate={onNavigateToPackages}
      />
    </div>
  );
}

export default AvailableSoftwareUpdates;
