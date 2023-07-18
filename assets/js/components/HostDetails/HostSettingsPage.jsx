import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import LoadingBox from '@components/LoadingBox';

import { TARGET_HOST } from '@lib/model';

import { hostChecksSelected, isSaving } from '@state/checksSelection';
import { updateCatalog } from '@state/actions/catalog';
import { getCatalog } from '@state/selectors/catalog';
import { getHost } from '@state/selectors';
import { getHostCheckSelection } from '@state/selectors/checksSelection';
import HostChecksSelection from './HostChecksSelection';

function HostSettingsPage() {
  const dispatch = useDispatch();

  const { hostID } = useParams();
  const host = useSelector(getHost(hostID));

  const {
    data: catalog,
    error: catalogError,
    loading: catalogLoading,
  } = useSelector(getCatalog());

  const { status } = useSelector(getHostCheckSelection(hostID));

  if (!host) {
    return <LoadingBox text="Loading..." />;
  }

  const {
    hostname: hostName,
    provider,
    agent_version: agentVersion,
    selected_checks: selectedChecks,
  } = host;

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
      selectedChecks={selectedChecks}
      catalog={catalog}
      catalogError={catalogError}
      catalogLoading={catalogLoading}
      onUpdateCatalog={refreshCatalog}
      isSavingSelection={isSaving(status)}
      onSaveSelection={saveSelection}
    />
  );
}

export default HostSettingsPage;
