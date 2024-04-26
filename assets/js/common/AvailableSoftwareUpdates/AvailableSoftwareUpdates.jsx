import React from 'react';
import classNames from 'classnames';
import { EOS_HEALING, EOS_PACKAGE_UPGRADE_OUTLINED } from 'eos-icons-react';
import { noop, gt } from 'lodash';

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
  relevantPatches,
  upgradablePackages,
  tooltip,
  softwareUpdatesSettingsLoading,
  softwareUpdatesLoading,
  connectionError = false,
  onBackToSettings = noop,
}) {
  if (softwareUpdatesSettingsLoading) {
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
        tooltip={tooltip}
        loading={softwareUpdatesLoading}
        connectionError={connectionError}
        icon={<EOS_HEALING size="xl" />}
      >
        {relevantPatches}
      </Indicator>

      <Indicator
        title="Upgradable Packages"
        tooltip={tooltip}
        loading={softwareUpdatesLoading}
        connectionError={connectionError}
        icon={<EOS_PACKAGE_UPGRADE_OUTLINED size="xl" />}
      >
        {upgradablePackages}
      </Indicator>
    </div>
  );
}

export default AvailableSoftwareUpdates;
