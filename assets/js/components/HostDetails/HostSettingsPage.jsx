import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import LoadingBox from '@components/LoadingBox';

import { TARGET_HOST } from '@lib/model';

import { hostChecksSelected } from '@state/checksSelection';
import { updateCatalog } from '@state/actions/catalog';
import { hostExecutionRequested } from '@state/actions/lastExecutions';
import { getCatalog } from '@state/selectors/catalog';
import { getHost, getHostSelectedChecks } from '@state/selectors/host';
import { isSaving } from '@state/selectors/checksSelection';

import PageHeader from '@components/PageHeader';
import BackButton from '@components/BackButton';

import ChecksSelection from '@components/ChecksSelection';

import ChecksSelectionHeader from '@components/ChecksSelection/ChecksSelectionHeader';
import HostInfoBox from './HostInfoBox';

function HostSettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hostID } = useParams();
  const [selection, setSelection] = useState([]);

  const host = useSelector(getHost(hostID));
  const selectedChecks = useSelector((state) =>
    getHostSelectedChecks(state, hostID)
  );

  const {
    data: catalog,
    error: catalogError,
    loading: catalogLoading,
  } = useSelector(getCatalog());

  const saving = useSelector(isSaving(TARGET_HOST, hostID));

  useEffect(() => {
    setSelection(selectedChecks);
  }, [selectedChecks]);

  if (!host) {
    return <LoadingBox text="Loading..." />;
  }
  const { hostname: hostName, provider, agent_version: agentVersion } = host;

  const refreshCatalog = () =>
    dispatch(
      updateCatalog({
        provider: host.provider,
        target_type: TARGET_HOST,
      })
    );

  const saveSelection = (newSelection, targetID, targetName) => {
    dispatch(
      hostChecksSelected({
        hostID: targetID,
        hostName: targetName,
        checks: newSelection,
      })
    );
  };

  const requestChecksExecution = () => {
    dispatch(hostExecutionRequested(host, selectedChecks, navigate));
  };

  return (
    <>
      <ChecksSelectionHeader
        targetID={hostID}
        targetName={hostName}
        backTo={
          <BackButton url={`/hosts/${hostID}`}>Back to Host Details</BackButton>
        }
        pageHeader={
          <PageHeader>
            Check Settings for <span className="font-bold">{hostName}</span>
          </PageHeader>
        }
        isSavingSelection={saving}
        savedSelection={selectedChecks}
        selection={selection}
        onSaveSelection={saveSelection}
        onStartExecution={requestChecksExecution}
      />
      <HostInfoBox provider={provider} agentVersion={agentVersion} />
      <ChecksSelection
        catalog={catalog}
        catalogError={catalogError}
        loading={catalogLoading}
        selectedChecks={selection}
        onUpdateCatalog={refreshCatalog}
        onChange={setSelection}
      />
    </>
  );
}

export default HostSettingsPage;
