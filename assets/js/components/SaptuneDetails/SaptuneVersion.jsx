import React from 'react';

import { isVersionSupported, SUPPORTED_VERSION } from '@lib/saptune';

import Tooltip from '@components/Tooltip';
import HealthIcon from '@components/Health/HealthIcon';

function SaptuneVersion({ version }) {
  if (!version) {
    return 'Not installed';
  }

  if (isVersionSupported(version)) {
    return version;
  }

  return (
    <div className="flex">
      <Tooltip
        content={`Saptune version not supported. Minimum supported version is ${SUPPORTED_VERSION}`}
        place="bottom"
      >
        <HealthIcon health="warning" />
      </Tooltip>
      <span className="ml-1">{version}</span>
    </div>
  );
}

export default SaptuneVersion;
