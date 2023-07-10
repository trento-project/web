import React from 'react';
import PageHeader from '@components/PageHeader';
import BackButton from '@components/BackButton';
import ChecksSelection from '@components/ChecksSelection/ChecksSelection';

import HostInfoBox from './HostInfoBox';

function HostChecksSelection({
  hostID,
  hostName,
  provider,
  agentVersion,
  selectedChecks,
  catalog,
  catalogError,
  catalogLoading,
  onUpdateCatalog,
}) {
  return (
    <div className="w-full px-2 sm:px-0">
      <BackButton url={`/hosts/${hostID}`}>Back to Host Details</BackButton>
      <PageHeader>
        Check Settings for <span className="font-bold">{hostName}</span>
      </PageHeader>
      <HostInfoBox provider={provider} agentVersion={agentVersion} />
      <ChecksSelection
        targetID={hostID}
        catalog={catalog}
        catalogError={catalogError}
        loading={catalogLoading}
        selected={selectedChecks}
        onSave={(_selectedChecks, _hostID) => {
          // TODO: dispatch check selection for a host
        }}
        onUpdateCatalog={() => onUpdateCatalog()}
        onClear={() => {
          // TODO
        }}
        saving={false}
        error={null}
        success={false}
      />
    </div>
  );
}

export default HostChecksSelection;
