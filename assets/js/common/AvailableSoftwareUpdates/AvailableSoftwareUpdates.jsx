import React from 'react';
import classNames from 'classnames';
import {
  EOS_HEALING,
  EOS_PACKAGE_UPGRADE_OUTLINED,
  EOS_SETTINGS,
} from 'eos-icons-react';
import { noop, gt } from 'lodash';

import Button from '@common/Button';
import Indicator from './Indicator';

function AvailableSoftwareUpdates({
  className,
  settingsConfigured = false,
  relevantPatches,
  upgradablePackages,
  tooltip,
  loading,
  connectionError = false,
  onBackToSettings = noop,
}) {
  const containerStyles = classNames(
    'flex',
    'items-center',
    'bg-white',
    'rounded-md',
    'm-2',
    'p-5',
    'gap-x-8',
    'shadow'
  );

  if (!settingsConfigured) {
    return (
      <div
        className={classNames(
          containerStyles,
          'place-content-between',
          className
        )}
      >
        <div>
          <p className="font-bold text-2xl">Available Software Updates</p>

          <p>
            SUSE Manager is not configured. Go to Settings to add your SUSE
            Manager connection credentials.
          </p>
        </div>

        <Button
          type="primary-white-fit"
          className="inline-block mx-0.5 border-green-500 border"
          size="small"
          onClick={onBackToSettings}
        >
          <EOS_SETTINGS className="inline-block fill-jungle-green-500" />{' '}
          Settings
        </Button>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        containerStyles,
        'flex-row',
        'place-content-stretch',
        'w-full',
        className
      )}
    >
      <p className="font-bold text-2xl grow-0">Available Software Updates</p>

      <Indicator
        title="Relevant Patches"
        critical={gt(relevantPatches, 0)}
        tooltip={tooltip}
        loading={loading}
        connectionError={connectionError}
        icon={<EOS_HEALING size="xl" />}
      >
        {relevantPatches}
      </Indicator>

      <Indicator
        title="Upgradable Packages"
        tooltip={tooltip}
        loading={loading}
        connectionError={connectionError}
        icon={<EOS_PACKAGE_UPGRADE_OUTLINED size="xl" />}
      >
        {upgradablePackages}
      </Indicator>
    </div>
  );
}

export default AvailableSoftwareUpdates;
