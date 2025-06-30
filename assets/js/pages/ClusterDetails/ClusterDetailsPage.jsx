import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { get } from 'lodash';

import { getFromConfig } from '@lib/config';

import {
  getCluster,
  getClusterHosts,
  getClusterSapSystems,
  getEnsaVersion,
  getFilesystemType,
} from '@state/selectors/cluster';
import { getCatalog } from '@state/selectors/catalog';
import { getLastExecution } from '@state/selectors/lastExecutions';
import { getUserProfile } from '@state/selectors/user';
import { updateCatalog } from '@state/catalog';
import { executionRequested, updateLastExecution } from '@state/lastExecutions';
import {
  operationRequested,
  updateRunningOperations,
  removeRunningOperation,
} from '@state/runningOperations';
import { getRunningOperation } from '@state/selectors/runningOperations';

import { buildEnv } from '@lib/checks';
import { TARGET_CLUSTER } from '@lib/model';
import {
  ASCS_ERS,
  HANA_SCALE_OUT,
  HANA_SCALE_UP,
  getClusterSids,
  isValidClusterType,
} from '@lib/model/clusters';

import ClusterDetails from './ClusterDetails';
import AscsErsClusterDetails from './AscsErsClusterDetails';
import HanaClusterDetails from './HanaClusterDetails';
import { getClusterName } from './ClusterLink';

const operationsEnabled = getFromConfig('operationsEnabled');

function ClusterDetailComponent({ clusterType, ...props }) {
  switch (clusterType) {
    case HANA_SCALE_UP:
    case HANA_SCALE_OUT:
      return <HanaClusterDetails clusterType={clusterType} {...props} />;
    case ASCS_ERS:
      return <AscsErsClusterDetails {...props} />;
    default:
      return null;
  }
}

export function ClusterDetailsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { clusterID } = useParams();

  const cluster = useSelector(getCluster(clusterID));

  const provider = get(cluster, 'provider');
  const type = get(cluster, 'type');
  const architectureType = get(cluster, 'details.architecture_type');
  const hanaScenario = get(cluster, 'details.hana_scenario');

  const catalog = useSelector(getCatalog());

  const lastExecution = useSelector(getLastExecution(clusterID));

  const ensaVersion = useSelector((state) => getEnsaVersion(state, clusterID));
  const filesystemType = useSelector((state) =>
    getFilesystemType(state, clusterID)
  );

  const { abilities } = useSelector(getUserProfile);

  useEffect(() => {
    const env = buildEnv({
      provider,
      target_type: TARGET_CLUSTER,
      cluster_type: type,
      hana_scenario: hanaScenario,
      ensa_version: ensaVersion,
      filesystem_type: filesystemType,
      architecture_type: architectureType,
    });

    if (provider && type) {
      dispatch(updateCatalog(env));
      dispatch(updateLastExecution(clusterID));
    }
    operationsEnabled && dispatch(updateRunningOperations());
  }, [dispatch, provider, type, ensaVersion, filesystemType, architectureType]);

  const clusterHosts = useSelector((state) =>
    getClusterHosts(state, clusterID)
  );

  const clusterSapSystems = useSelector((state) =>
    getClusterSapSystems(state, clusterID)
  );

  const runningOperation = useSelector(getRunningOperation(clusterID));

  if (!cluster) {
    return <div>Loading...</div>;
  }
  const hasSelectedChecks = cluster.selected_checks.length > 0;

  if (!isValidClusterType(type)) {
    return <div>Unknown cluster type</div>;
  }

  return (
    <ClusterDetails
      clusterID={clusterID}
      clusterName={getClusterName(cluster)}
      details={cluster.details}
      hasSelectedChecks={hasSelectedChecks}
      hosts={clusterHosts}
      lastExecution={lastExecution}
      operationsEnabled={operationsEnabled}
      runningOperation={runningOperation}
      selectedChecks={cluster.selected_checks}
      userAbilities={abilities}
      onStartExecution={(_, hostList, checks) =>
        dispatch(executionRequested(clusterID, hostList, checks))
      }
      onRequestOperation={(operation, params) =>
        dispatch(
          operationRequested({
            groupID: clusterID,
            operation,
            requestParams: { clusterID, params },
          })
        )
      }
      onCleanForbiddenOperation={() =>
        dispatch(removeRunningOperation({ groupID: clusterID }))
      }
      onRequestHostOperation={(operation, params) =>
        dispatch(
          operationRequested({
            groupID: clusterID,
            operation,
            requestParams: params,
          })
        )
      }
      navigate={navigate}
    >
      <ClusterDetailComponent
        clusterType={cluster.type}
        // common props for all cluster types
        clusterID={clusterID}
        hosts={clusterHosts}
        cibLastWritten={cluster.cib_last_written}
        provider={cluster.provider}
        details={cluster.details}
        catalog={catalog}
        lastExecution={lastExecution}
        sapSystems={clusterSapSystems}
        userAbilities={abilities}
        navigate={navigate}
        // the following props are specific to hana details
        clusterSids={getClusterSids(cluster)}
      />
    </ClusterDetails>
  );
}
