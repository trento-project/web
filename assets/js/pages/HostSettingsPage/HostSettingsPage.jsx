import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import LoadingBox from '@common/LoadingBox';

import { TARGET_HOST } from '@lib/model';

import { hostChecksSelected } from '@state/checksSelection';
import { hostExecutionRequested } from '@state/lastExecutions';
import { getHost, getHostSelectedChecks } from '@state/selectors/host';
import { isSaving } from '@state/selectors/checksSelection';
import { getUserProfile } from '@state/selectors/user';

import BackButton from '@common/BackButton';
import HostInfoBox from '@common/HostInfoBox';
import PageHeader from '@common/PageHeader';

import ChecksSelection, { useChecksSelection } from '@pages/ChecksSelection';
import ChecksSelectionHeader from '@pages/ChecksSelection/ChecksSelectionHeader';

function HostSettingsPage() {
  const dispatch = useDispatch();
  const { hostID } = useParams();
  const [selection, setSelection] = useState([]);

  const { abilities } = useSelector(getUserProfile);
  const host = useSelector(getHost(hostID));
  const selectedChecks = useSelector((state) =>
    getHostSelectedChecks(state, hostID)
  );

  const {
    fetchChecksSelection,
    checksSelection,
    checksSelectionLoading,
    checksSelectionFetchError,
  } = useChecksSelection();

  const saving = useSelector(isSaving(TARGET_HOST, hostID));

  useEffect(() => {
    setSelection(selectedChecks);
  }, [selectedChecks]);

  if (!host) {
    return <LoadingBox text="Loading..." />;
  }
  const { hostname: hostName, provider, agent_version: agentVersion } = host;

  const refreshChecksSelection = () =>
    fetchChecksSelection(hostID, {
      provider: host.provider,
      target_type: TARGET_HOST,
    });

  const saveSelection = (newSelection, targetID, targetName) => {
    dispatch(
      hostChecksSelected({
        hostID: targetID,
        hostName: targetName,
        checks: newSelection,
      })
    );
  };

  const saveCustomCheck = (values) => {
    // ToDo for later when we hook up frontend and backend.
    const { checksID, customValues } = values;
    const payload = {
      checkID: checksID,
      groupID: hostID,
      customCheckValues: customValues,
    };
    // dispatch payload in future pr
    return payload;
  };

  const requestChecksExecution = () => {
    dispatch(hostExecutionRequested(host, selectedChecks));
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
        userAbilities={abilities}
        checkSelectionPermittedFor={['all:host_checks_selection']}
        checkExecutionPermittedFor={['all:host_checks_execution']}
        onSaveSelection={saveSelection}
        onStartExecution={requestChecksExecution}
      />
      <HostInfoBox provider={provider} agentVersion={agentVersion} />
      <ChecksSelection
        catalog={checksSelection}
        catalogError={checksSelectionFetchError}
        loading={checksSelectionLoading}
        selectedChecks={selection}
        userAbilities={abilities}
        onUpdateCatalog={refreshChecksSelection}
        onChange={setSelection}
        provider={provider}
        saveCustomCheck={saveCustomCheck}
      />
    </>
  );
}

export default HostSettingsPage;
