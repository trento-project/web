import React from 'react';

import { find } from 'lodash';

import { Link } from 'react-router-dom';

import BackButton from '@components/BackButton';
import ListView from '@components/ListView';
import PageHeader from '@components/PageHeader';

import SaptuneTuningState from './SaptuneTuningState';
import SaptuneVersion from './SaptuneVersion';

const renderService = (serviceName, services) => {
  const currentService = find(services, { name: serviceName });

  if (!currentService.enabled) {
    return <span>-</span>;
  }

  return (
    <span>
      {currentService.enabled}/{currentService.active}
    </span>
  );
};

const renderNote = (noteID) => (
  <Link
    key={noteID}
    className="text-jungle-green-500 hover:opacity-75"
    to={`https://launchpad.support.sap.com/#/notes/${noteID}`}
  >
    {noteID}
  </Link>
);

const renderNotes = (notes) =>
  notes.map((noteID, index) => [index > 0 && ', ', renderNote(noteID)]);

const renderSolution = ({ id, notes, partial }) => (
  <span>
    {id} ({renderNotes(notes)} {partial ? ' -> Partial' : ''})
  </span>
);

function SaptuneDetails({
  appliedSolution,
  enabledSolution,
  configuredVersion,
  hostname,
  hostID,
  packageVersion,
  services,
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

      <div className="flex flex-direction-row mt-5">
        <h2 className="text-2xl font-bold self-center">
          Saptune Services Status
        </h2>
      </div>
      <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
        <ListView
          orientation="vertical"
          data={[
            {
              title: 'saptune.service',
              content: renderService('saptune', services),
            },
            {
              title: 'sapconf.service',
              content: renderService('sapconf', services),
            },
            {
              title: 'tuned.service',
              content: renderService('tuned', services),
            },
          ]}
        />
      </div>

      <div className="flex flex-direction-row mt-5">
        <h2 className="text-2xl font-bold self-center">
          Saptune Tuning Solutions
        </h2>
      </div>
      <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
        <ListView
          orientation="vertical"
          data={[
            {
              title: 'Enabled Solution',
              content: renderSolution(enabledSolution),
            },
            {
              title: 'Applied Solution',
              content: renderSolution(appliedSolution),
            },
          ]}
        />
      </div>
    </div>
  );
}

export default SaptuneDetails;
