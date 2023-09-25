import React from 'react';

import BackButton from '@components/BackButton';
import ListView from '@components/ListView';
import PageHeader from '@components/PageHeader';

import SaptuneTuningState from './SaptuneTuningState';
import SaptuneVersion from './SaptuneVersion';

function SaptuneDetails({
  configuredVersion,
  hostname,
  hostID,
  packageVersion,
  tuningState,
}) {
  return (
    <div>
      <BackButton url={`/hosts/${hostID}`}>Back to Host Details</BackButton>
      <div className="flex flex-wrap">
        <div className="flex w-1/2 h-auto overflow-hidden overflow-ellipsis break-words">
          <PageHeader>
            Saptune Details: <span className="font-bold">{hostname}</span>
          </PageHeader>
        </div>
      </div>

      <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
        <ListView
          orientation="vertical"
          data={[
            {
              title: 'Package',
              content: <SaptuneVersion version={packageVersion} />,
            },
            {
              title: 'Configured Version',
              content: configuredVersion,
            },
            {
              title: 'Tuning',
              content: <SaptuneTuningState state={tuningState} />,
            },
          ]}
        />
      </div>
    </div>
  );
}

export default SaptuneDetails;
