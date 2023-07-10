import React from 'react';
import PageHeader from '@components/PageHeader';
import BackButton from '@components/BackButton';
import { HostInfoBox } from '@components/HostDetails';

import ChecksSelection from '@components/ChecksSelection/ChecksSelection';

function HostChecksSelection({
  host,
  catalog,
  catalogError,
  catalogLoading,
  onUpdateCatalog,
}) {
  const { hostID } = host;

  return (
    <div className="w-full px-2 sm:px-0">
      <BackButton url={`/hosts/${hostID}`}>Back to Host Details</BackButton>
      <PageHeader>
        Check Settings for <span className="font-bold">{host.hostname}</span>
      </PageHeader>
      <HostInfoBox provider={host.provider} agentVersion={host.agent_version} />
      <ChecksSelection
        targetID={hostID}
        catalog={catalog}
        catalogError={catalogError}
        loading={catalogLoading}
        selected={host.selected_checks}
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
