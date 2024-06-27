import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
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
import { updateCatalog } from '@state/catalog';
import { getCatalog } from '@state/selectors/catalog';
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

import ChecksSelection from '@pages/ChecksSelection';
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
  const navigate = useNavigate();
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
    data: catalog,
    error: catalogError,
    loading: catalogLoading,
  } = useSelector(getCatalog());

  const saving = useSelector(isSaving(TARGET_CLUSTER, clusterID));

  useEffect(() => {
    setSelection(selectedChecks);
  }, [selectedChecks]);

  if (!cluster) {
    return <LoadingBox text="Loading..." />;
  }

  const provider = get(cluster, 'provider');
  const type = get(cluster, 'type');

  const refreshCatalog = () => {
    const env = buildEnv({
      provider,
      target_type: TARGET_CLUSTER,
      cluster_type: type,
      ensa_version: ensaVersion,
      filesystem_type: filesystemType,
    });

    dispatch(updateCatalog(env));
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
    dispatch(
      executionRequested(clusterID, clusterHosts, selectedChecks, navigate)
    );
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
        onSaveSelection={saveSelection}
        onStartExecution={requestChecksExecution}
      />
      {catalogBanner[provider]}
      <ClusterInfoBox haScenario={type} provider={provider} />
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

export default ClusterSettingsPage;
