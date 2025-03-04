import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { get } from 'lodash';

import { clusterChecksSelected } from '@state/checksSelection';
import {
  getCluster,
  getClusterName,
  getClusterSelectedChecks,
  getClusterHosts,
  getFilesystemType,
  getEnsaVersion,
} from '@state/selectors/cluster';
import { isSaving } from '@state/selectors/checksSelection';
import { getUserProfile } from '@state/selectors/user';
import { executionRequested } from '@state/lastExecutions';

import { buildEnv } from '@lib/checks';
import { UNKNOWN_PROVIDER, TARGET_CLUSTER } from '@lib/model';

import BackButton from '@common/BackButton';
import ClusterInfoBox from '@common/ClusterInfoBox';
import LoadingBox from '@common/LoadingBox';
import PageHeader from '@common/PageHeader';
import Banner from '@common/Banners/Banner';

import ChecksSelection, { useChecksSelection } from '@pages/ChecksSelection';
import ChecksSelectionHeader from '@pages/ChecksSelection/ChecksSelectionHeader';

const catalogBanner = {
  [UNKNOWN_PROVIDER]: (
    <Banner type="warning">
      The following catalog is valid for on-premise bare metal platforms.
      <br />
      If you are running your HANA cluster on a different platform, please use
      results with caution
    </Banner>
  ),
};

function ClusterSettingsPage() {
  const dispatch = useDispatch();
  const { clusterID } = useParams();
  const [selection, setSelection] = useState([]);

  const { abilities } = useSelector(getUserProfile);
  const cluster = useSelector(getCluster(clusterID));

  const clusterHosts = useSelector((state) =>
    getClusterHosts(state, clusterID)
  );
  const selectedChecks = useSelector((state) =>
    getClusterSelectedChecks(state, clusterID)
  );
  const clusterName = useSelector(getClusterName(clusterID));
  const ensaVersion = useSelector((state) => getEnsaVersion(state, clusterID));
  const filesystemType = useSelector((state) =>
    getFilesystemType(state, clusterID)
  );

  const {
    fetchChecksSelection,
    resetChecksCustomization,
    checksSelection,
    checksSelectionLoading,
    checksSelectionFetchError,
    saveChecksCustomization,
  } = useChecksSelection();

  const saving = useSelector(isSaving(TARGET_CLUSTER, clusterID));

  useEffect(() => {
    setSelection(selectedChecks);
  }, [selectedChecks]);

  if (!cluster) {
    return <LoadingBox text="Loading..." />;
  }

  const provider = get(cluster, 'provider');
  const type = get(cluster, 'type');
  const hanaScenario = get(cluster, 'details.hana_scenario');
  const architectureType = get(cluster, 'details.architecture_type');

  const refreshChecksSelection = () => {
    const env = buildEnv({
      provider,
      target_type: TARGET_CLUSTER,
      cluster_type: type,
      hana_scenario: hanaScenario,
      ensa_version: ensaVersion,
      filesystem_type: filesystemType,
      architecture_type: architectureType,
    });

    fetchChecksSelection(clusterID, env);
  };

  const saveSelection = (newSelection, targetID, targetName) =>
    dispatch(
      clusterChecksSelected({
        clusterID: targetID,
        clusterName: targetName,
        checks: newSelection,
      })
    );

  const requestChecksExecution = () => {
    dispatch(executionRequested(clusterID, clusterHosts, selectedChecks));
  };

  return (
    <>
      <ChecksSelectionHeader
        targetID={clusterID}
        targetName={clusterName}
        backTo={
          <BackButton url={`/clusters/${clusterID}`}>
            Back to Cluster Details
          </BackButton>
        }
        pageHeader={
          <PageHeader>
            Cluster Settings for{' '}
            <span className="font-bold">{clusterName}</span>
          </PageHeader>
        }
        isSavingSelection={saving}
        savedSelection={selectedChecks}
        selection={selection}
        userAbilities={abilities}
        checkSelectionPermittedFor={['all:cluster_checks_selection']}
        checkExecutionPermittedFor={['all:cluster_checks_execution']}
        onSaveSelection={saveSelection}
        onStartExecution={requestChecksExecution}
      />
      {catalogBanner[provider]}
      <ClusterInfoBox
        clusterType={type}
        scaleUpScenario={hanaScenario}
        provider={provider}
        architectureType={architectureType}
      />
      <ChecksSelection
        groupID={clusterID}
        catalog={checksSelection}
        catalogError={checksSelectionFetchError}
        loading={checksSelectionLoading}
        selectedChecks={selection}
        userAbilities={abilities}
        onUpdateCatalog={refreshChecksSelection}
        onChange={setSelection}
        provider={provider}
        saveCustomCheck={saveChecksCustomization}
        onResetCheckCustomization={resetChecksCustomization}
      />
    </>
  );
}

export default ClusterSettingsPage;
