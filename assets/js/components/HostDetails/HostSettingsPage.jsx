import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import LoadingBox from '@components/LoadingBox';
import { canStartExecution } from '@components/ChecksSelection';

import { TARGET_HOST } from '@lib/model';

import { hostChecksSelected } from '@state/checksSelection';
import { updateCatalog } from '@state/actions/catalog';
import { getCatalog } from '@state/selectors/catalog';
import { getHost, getHostSelectedChecks } from '@state/selectors/host';
import { isSaving } from '@state/selectors/checksSelection';
import HostChecksSelection from './HostChecksSelection';

function HostSettingsPage() {
  const dispatch = useDispatch();

  const { hostID } = useParams();
  const host = useSelector(getHost(hostID));
  const hostSelectedChecks = useSelector((state) =>
    getHostSelectedChecks(state, hostID)
  );
  const [selection, setSelection] = useState([]);
  useEffect(() => {
    if (host) {
      setSelection(hostSelectedChecks);
    }
  }, [hostSelectedChecks]);

  const {
    data: catalog,
    error: catalogError,
    loading: catalogLoading,
  } = useSelector(getCatalog());

  const saving = useSelector(isSaving(TARGET_HOST, hostID));
  const hostChecksExecutionEnabled = !canStartExecution(
    hostSelectedChecks,
    saving
  );

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

  const saveSelection = (newSelection, targetID, targetName) =>
    dispatch(
      hostChecksSelected({
        hostID: targetID,
        hostName: targetName,
        checks: newSelection,
      })
    );

  return (
    <HostChecksSelection
      hostID={hostID}
      hostName={hostName}
      provider={provider}
      agentVersion={agentVersion}
      catalog={catalog}
      catalogError={catalogError}
      catalogLoading={catalogLoading}
      onUpdateCatalog={refreshCatalog}
      isSavingSelection={saving}
      onSaveSelection={saveSelection}
      selectedChecks={selection}
      hostChecksExecutionEnabled={hostChecksExecutionEnabled}
      onSelectedChecksChange={setSelection}
    />
  );
}

export default HostSettingsPage;
