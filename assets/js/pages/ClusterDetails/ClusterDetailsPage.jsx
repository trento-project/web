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
import { getClusterSids } from '@lib/model/clusters';

import ClusterDetails from './ClusterDetails';
import AscsErsClusterDetails from './AscsErsClusterDetails';
import HanaClusterDetails from './HanaClusterDetails';
import { getClusterName } from './ClusterLink';

const operationsEnabled = getFromConfig('operationsEnabled');

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

  switch (cluster.type) {
    case 'hana_scale_up':
    case 'hana_scale_out':
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
          navigate={navigate}
        >
          <HanaClusterDetails
            clusterID={clusterID}
            hosts={clusterHosts}
            clusterType={cluster.type}
            cibLastWritten={cluster.cib_last_written}
            clusterSids={getClusterSids(cluster)}
            provider={cluster.provider}
            sapSystems={clusterSapSystems}
            details={cluster.details}
            catalog={catalog}
            lastExecution={lastExecution}
            navigate={navigate}
          />
        </ClusterDetails>
      );
    case 'ascs_ers':
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
          navigate={navigate}
        >
          <AscsErsClusterDetails
            clusterID={clusterID}
            cibLastWritten={cluster.cib_last_written}
            provider={cluster.provider}
            hosts={clusterHosts}
            sapSystems={clusterSapSystems}
            details={cluster.details}
            catalog={catalog}
            lastExecution={lastExecution}
            navigate={navigate}
          />
        </ClusterDetails>
      );
    default:
      return <div>Unknown cluster type</div>;
  }
}
