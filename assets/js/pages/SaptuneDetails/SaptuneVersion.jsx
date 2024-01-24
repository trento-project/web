import React from 'react';

import { isVersionSupported, SUPPORTED_VERSION } from '@lib/saptune';

import Tooltip from '@common/Tooltip';
import HealthIcon from '@common/HealthIcon';

function SaptuneVersion({ sapPresent = true, version }) {
  if (!version) {
    return sapPresent ? (
      <div className="flex">
        <HealthIcon health="warning" />
        <span className="ml-1">Not installed</span>
      </div>
    ) : (
      <span>Not installed</span>
    );
  }

  if (isVersionSupported(version)) {
    return <span>{version}</span>;
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
