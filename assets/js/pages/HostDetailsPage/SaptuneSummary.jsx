import React from 'react';

import { isVersionSupported } from '@lib/saptune';

import Button from '@common/Button';
import ListView from '@common/ListView';
import { SaptuneVersion, SaptuneTuningState } from '@pages/SaptuneDetails';

function SaptuneSummary({
  sapPresent,
  onViewDetails,
  saptuneVersion,
  saptuneConfiguredVersion,
  saptuneTuning,
}) {
  return (
    <>
      <div className="flex justify-between mb-2">
        <h1 className="text-2xl font-bold">Saptune Summary</h1>
        <Button
          type="primary-white-fit"
          className="border-green-500 border"
          size="small"
          disabled={!isVersionSupported(saptuneVersion)}
          onClick={onViewDetails}
        >
          View Details
        </Button>
      </div>
      <ListView
        className="grid-rows-2"
        orientation="vertical"
        data={[
          {
            title: 'Package',
            content: (
              <SaptuneVersion
                sapPresent={sapPresent}
                version={saptuneVersion}
              />
            ),
          },
          {
            title: 'Tuning',
            content: <SaptuneTuningState state={saptuneTuning} />,
          },
          {
            title: 'Configured Version',
            content: saptuneConfiguredVersion || '-',
          },
        ]}
      />
    </>
  );
}

export default SaptuneSummary;
