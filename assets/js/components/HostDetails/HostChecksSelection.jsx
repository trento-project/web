import React, { useState } from 'react';
import { EOS_PLAY_CIRCLE } from 'eos-icons-react';

import PageHeader from '@components/PageHeader';
import BackButton from '@components/BackButton';
import Button from '@components/Button';
import ChecksSelection from '@components/ChecksSelection';

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
  isSavingSelection,
  onSaveSelection,
}) {
  const [selection, setSelection] = useState(selectedChecks);

  return (
    <div className="w-full px-2 sm:px-0">
      <BackButton url={`/hosts/${hostID}`}>Back to Host Details</BackButton>

      <div className="flex flex-wrap">
        <div className="flex w-1/2 h-auto overflow-hidden overflow-ellipsis break-words">
          <PageHeader>
            Check Settings for <span className="font-bold">{hostName}</span>
          </PageHeader>
        </div>
        <div className="flex w-1/2 justify-end">
          <div className="flex w-fit whitespace-nowrap">
            <Button
              type="primary"
              className="mx-1"
              onClick={() => onSaveSelection(selection, hostID, hostName)}
              disabled={isSavingSelection}
            >
              Save Checks Selection
            </Button>
            <Button type="primary" className="mx-1" onClick={() => {}} disabled>
              <EOS_PLAY_CIRCLE className="fill-white inline-block align-sub" />{' '}
              Start Execution
            </Button>
          </div>
        </div>
      </div>

      <HostInfoBox provider={provider} agentVersion={agentVersion} />
      <ChecksSelection
        catalog={catalog}
        catalogError={catalogError}
        loading={catalogLoading}
        selectedChecks={selection}
        onUpdateCatalog={() => onUpdateCatalog()}
        onChange={setSelection}
      />
    </div>
  );
}

export default HostChecksSelection;
