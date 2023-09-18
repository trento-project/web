import React, { useEffect, useState } from 'react';
import { EOS_PLAY_CIRCLE } from 'eos-icons-react';

import PageHeader from '@components/PageHeader';
import BackButton from '@components/BackButton';
import Button from '@components/Button';
import ChecksSelection from '@components/ChecksSelection';
import Tooltip from '@components/Tooltip';

import HostInfoBox from './HostInfoBox';

const defaultSavedSelection = [];

function HostChecksSelection({
  hostID,
  hostName,
  provider,
  agentVersion,
  catalog,
  catalogError,
  catalogLoading,
  onUpdateCatalog,
  isSavingSelection,
  onSaveSelection,
  hostChecksExecutionEnabled,
  onStartExecution = () => {},
  savedHostSelection = defaultSavedSelection,
}) {
  const [selection, setSelection] = useState([]);
  useEffect(() => {
    setSelection(savedHostSelection);
  }, [savedHostSelection]);

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
            <Tooltip
              className="w-56"
              content="Click Start Execution or wait for Trento to periodically run checks."
              visible={savedHostSelection?.length > 0}
            >
              <Button
                type="primary"
                className="mx-1"
                onClick={onStartExecution}
                disabled={hostChecksExecutionEnabled}
              >
                <EOS_PLAY_CIRCLE className="fill-white inline-block align-sub disabled:fill-gray-200" />{' '}
                Start Execution
              </Button>
            </Tooltip>
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
