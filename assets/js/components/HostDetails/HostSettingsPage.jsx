import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import LoadingBox from '@components/LoadingBox';

import { checksSelected } from '@state/hostChecksSelection';
import { updateCatalog } from '@state/actions/catalog';
import { getCatalog } from '@state/selectors/catalog';
import { getHost } from '@state/selectors';
import { getCheckSelection } from '@state/selectors/hostChecksSelection';
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

  const { saving } = useSelector(getCheckSelection());

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
        target_type: 'host',
      })
    );

  const saveSelection = (selection, targetID, targetName) =>
    dispatch(
      checksSelected({
        hostID: targetID,
        hostName: targetName,
        checks: selection,
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
      isSavingSelection={saving}
      onSaveSelection={saveSelection}
    />
  );
}

export default HostSettingsPage;
