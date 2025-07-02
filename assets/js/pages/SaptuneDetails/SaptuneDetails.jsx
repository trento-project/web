import React from 'react';
import { useParams } from 'react-router';

import { find, map } from 'lodash';

import BackButton from '@common/BackButton';
import ListView from '@common/ListView';
import PageHeader from '@common/PageHeader';

import SaptuneTuningState from './SaptuneTuningState';
import SaptuneVersion from './SaptuneVersion';
import SaptuneServiceStatus from './SaptuneServiceStatus';

const renderService = (serviceName, services) => {
  const service = find(services, { name: serviceName });
  const { enabled, active } = service;

  return (
    <SaptuneServiceStatus
      serviceName={serviceName}
      enabled={enabled}
      active={active}
    />
  );
};

const renderNote = (noteID) => (
  <a
    key={noteID}
    className="text-jungle-green-500 hover:opacity-75"
    href={`https://me.sap.com/notes/${noteID}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    {noteID}
  </a>
);

const renderNotes = (notes) => {
  if (notes.length === 0) {
    return <span>-</span>;
  }
  return notes.map((noteID, index) => [index > 0 && ', ', renderNote(noteID)]);
};

const renderSolution = (solution) => {
  if (!solution) {
    return <span>-</span>;
  }
  const { id, notes, partial } = solution;

  return (
    <span>
      {id} ({renderNotes(notes)}
      {partial ? '-> Partial' : ''})
    </span>
  );
};

function SaptuneDetails({
  appliedNotes,
  appliedSolution,
  enabledNotes,
  enabledSolution,
  configuredVersion,
  hostname,
  hostID,
  packageVersion,
  services,
  staging,
  tuningState,
}) {
  const { hostID: paramHostID } = useParams();
  const resolvedHostID = hostID || paramHostID;
  return (
    <div>
      <BackButton url={`/hosts/${resolvedHostID}`}>
        Back to Host Details
      </BackButton>
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

      <div className="flex flex-direction-row mt-7">
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

      <div className="flex flex-direction-row mt-7">
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

      <div className="flex flex-direction-row mt-7">
        <h2 className="text-2xl font-bold self-center">Saptune Tuning Notes</h2>
      </div>
      <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
        <ListView
          orientation="vertical"
          data={[
            {
              title: 'Enabled Notes',
              content: renderNotes(map(enabledNotes, 'id')),
            },
            {
              title: 'Applied Notes',
              content: renderNotes(map(appliedNotes, 'id')),
            },
          ]}
        />
      </div>

      <div className="flex flex-direction-row mt-7">
        <h2 className="text-2xl font-bold self-center">
          Saptune Staging Status
        </h2>
      </div>
      <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
        <ListView
          orientation="vertical"
          data={[
            {
              title: 'Staging',
              content: staging.enabled ? (
                <span>Enabled</span>
              ) : (
                <span>Disabled</span>
              ),
            },
            {
              title: 'Staged Notes',
              content: renderNotes(staging.notes),
            },
            {
              title: 'Staged Solutions',
              content: staging.solutions_ids.join(', ') || <span>-</span>,
            },
          ]}
        />
      </div>
    </div>
  );
}

export default SaptuneDetails;
