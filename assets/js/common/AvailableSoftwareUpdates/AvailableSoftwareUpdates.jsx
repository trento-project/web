import React from 'react';
import classNames from 'classnames';
import { gt } from 'lodash';
import { EOS_HEALING, EOS_PACKAGE_UPGRADE_OUTLINED } from 'eos-icons-react';

import Indicator from './Indicator';

function AvailableSoftwareUpdates({
  className,
  relevantPatches,
  upgradablePackages,
  tooltip,
  loading,
}) {
  return (
    <div
      className={classNames(
        'flex',
        'flex-row',
        'items-center',
        'place-content-stretch',
        'w-full',
        'bg-white',
        'rounded-md',
        'm-2',
        'p-5',
        'gap-x-8',
        'shadow',
        className
      )}
    >
      <p className="font-bold text-2xl grow-0">Available Software Updates</p>

      <Indicator
        title="Relevant Patches"
        critical={gt(relevantPatches, 0)}
        tooltip={tooltip}
        loading={loading}
        icon={<EOS_HEALING size="xl" />}
      >
        {relevantPatches}
      </Indicator>

      <Indicator
        title="Upgradable Packages"
        tooltip={tooltip}
        loading={loading}
        icon={<EOS_PACKAGE_UPGRADE_OUTLINED size="xl" />}
      >
        {upgradablePackages}
      </Indicator>
    </div>
  );
}

export default AvailableSoftwareUpdates;
