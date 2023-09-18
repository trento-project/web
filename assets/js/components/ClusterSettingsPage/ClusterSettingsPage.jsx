import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { EOS_PLAY_CIRCLE } from 'eos-icons-react';

import { clusterChecksSelected } from '@state/checksSelection';
import {
  getCluster,
  getClusterName,
  getClusterSelectedChecks,
  getClusterHosts,
} from '@state/selectors/cluster';
import { updateCatalog } from '@state/actions/catalog';
import { getCatalog } from '@state/selectors/catalog';
import { isSaving } from '@state/selectors/checksSelection';
import { executionRequested } from '@state/actions/lastExecutions';

import Button from '@components/Button';
import { ClusterInfoBox } from '@components/ClusterDetails';
import ChecksSelection, {
  canStartExecution,
} from '@components/ChecksSelection';
import PageHeader from '@components/PageHeader';
import BackButton from '@components/BackButton';
import LoadingBox from '@components/LoadingBox';
import WarningBanner from '@components/Banners/WarningBanner';
import Tooltip from '@components/Tooltip';

import { UNKNOWN_PROVIDER, VMWARE_PROVIDER, TARGET_CLUSTER } from '@lib/model';

const catalogWarningBanner = {
  [UNKNOWN_PROVIDER]: (
    <WarningBanner>
      The following catalog is valid for on-premise bare metal platforms.
      <br />
      If you are running your HANA cluster on a different platform, please use
      results with caution
    </WarningBanner>
  ),
  [VMWARE_PROVIDER]: (
    <WarningBanner>
      Configuration checks for HANA scale-up performance optimized clusters on
      VMware are still in experimental phase. Please use results with caution.
    </WarningBanner>
  ),
};

function ClusterSettingsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { clusterID } = useParams();

  const cluster = useSelector(getCluster(clusterID));
  const clusterHosts = useSelector((state) =>
    getClusterHosts(state, clusterID)
  );
  const saving = useSelector(isSaving(TARGET_CLUSTER, clusterID));
  const selectedChecks = useSelector((state) =>
    getClusterSelectedChecks(state, clusterID)
  );
  const clusterName = useSelector(getClusterName(clusterID));

  const {
    data: catalog,
    error: catalogError,
    loading: catalogLoading,
  } = useSelector(getCatalog());

  const [selection, setSelection] = useState(selectedChecks);

  useEffect(() => {
    setSelection(selectedChecks);
  }, [selectedChecks]);

  const saveSelection = useCallback(
    () =>
      dispatch(
        clusterChecksSelected({
          clusterID,
          clusterName,
          checks: selection,
        })
      ),
    [clusterID, clusterName, selection]
  );

  if (!cluster) {
    return <LoadingBox text="Loading..." />;
  }

  const { provider, type } = cluster;

  const refreshCatalog = () =>
    dispatch(
      updateCatalog({
        provider,
        target_type: TARGET_CLUSTER,
      })
    );

  const requestExecution = () => {
    dispatch(executionRequested(clusterID, clusterHosts, selection, navigate));
  };

  return (
    <div className="w-full px-2 sm:px-0">
      <BackButton url={`/clusters/${clusterID}`}>
        Back to Cluster Details
      </BackButton>

      <div className="flex flex-wrap">
        <div className="flex w-1/2 h-auto overflow-hidden overflow-ellipsis break-words">
          <PageHeader>
            Cluster Settings for{' '}
            <span className="font-bold">{clusterName}</span>
          </PageHeader>
        </div>
        <div className="flex w-1/2 justify-end">
          <div className="flex w-fit whitespace-nowrap">
            <Button
              type="primary"
              className="mx-1"
              onClick={saveSelection}
              disabled={saving}
            >
              Save Checks Selection
            </Button>
            <Tooltip
              className="w-56"
              content="Click Start Execution or wait for Trento to periodically run checks."
              visible={canStartExecution(selectedChecks, saving)}
            >
              <Button
                type="primary"
                className="mx-1"
                onClick={requestExecution}
                disabled={!canStartExecution(selectedChecks, saving)}
              >
                <EOS_PLAY_CIRCLE
                  className={`${
                    canStartExecution(selectedChecks, saving)
                      ? 'fill-white'
                      : 'fill-gray-200'
                  } inline-block align-sub`}
                />{' '}
                Start Execution
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
      {catalogWarningBanner[provider]}
      <ClusterInfoBox haScenario={type} provider={provider} />
      <ChecksSelection
        catalog={catalog}
        catalogError={catalogError}
        loading={catalogLoading}
        selectedChecks={selection}
        onUpdateCatalog={refreshCatalog}
        onChange={setSelection}
      />
    </div>
  );
}

export default ClusterSettingsPage;
