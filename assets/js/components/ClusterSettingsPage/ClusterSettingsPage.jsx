import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { clusterChecksSelected } from '@state/checksSelection';
import { getCluster } from '@state/selectors/cluster';
import { updateCatalog } from '@state/actions/catalog';
import { getCatalog } from '@state/selectors/catalog';
import { isSaving } from '@state/selectors/checksSelection';

import { ClusterInfoBox } from '@components/ClusterDetails';
import ChecksSelection from '@components/ChecksSelection';
import PageHeader from '@components/PageHeader';
import BackButton from '@components/BackButton';
import LoadingBox from '@components/LoadingBox';
import WarningBanner from '@components/Banners/WarningBanner';

import { UNKNOWN_PROVIDER, VMWARE_PROVIDER, TARGET_CLUSTER } from '@lib/model';

function ClusterSettingsPage() {
  const dispatch = useDispatch();
  const { clusterID } = useParams();

  const cluster = useSelector(getCluster(clusterID));
  const saving = useSelector(isSaving(TARGET_CLUSTER, clusterID));

  const {
    data: catalog,
    error: catalogError,
    loading: catalogLoading,
  } = useSelector(getCatalog());

  if (!cluster) {
    return <LoadingBox text="Loading..." />;
  }

  const {
    provider,
    type,
    selected_checks: selectedChecks,
    name: clusterName,
  } = cluster;

  const refreshCatalog = () =>
    dispatch(
      updateCatalog({
        provider,
        target_type: TARGET_CLUSTER,
      })
    );

  const saveSelection = (checks) =>
    dispatch(
      clusterChecksSelected({
        clusterID,
        clusterName,
        checks,
      })
    );

  return (
    <div className="w-full px-2 sm:px-0">
      <BackButton url={`/clusters/${clusterID}`}>
        Back to Cluster Details
      </BackButton>
      <PageHeader>
        Cluster Settings for <span className="font-bold">{clusterName}</span>
      </PageHeader>
      {provider === UNKNOWN_PROVIDER && (
        <WarningBanner>
          The following catalog is valid for on-premise bare metal platforms.
          <br />
          If you are running your HANA cluster on a different platform, please
          use results with caution
        </WarningBanner>
      )}
      {provider === VMWARE_PROVIDER && (
        <WarningBanner>
          Configuration checks for HANA scale-up performance optimized clusters
          on VMware are still in experimental phase. Please use results with
          caution.
        </WarningBanner>
      )}
      <ClusterInfoBox haScenario={type} provider={provider} />
      <ChecksSelection
        targetID={clusterID}
        targetName={clusterName}
        catalog={catalog}
        catalogError={catalogError}
        loading={catalogLoading}
        selected={selectedChecks}
        onSave={saveSelection}
        onUpdateCatalog={refreshCatalog}
        onClear={() => {
          // TODO
        }}
        saving={saving}
      />
    </div>
  );
}

export default ClusterSettingsPage;
