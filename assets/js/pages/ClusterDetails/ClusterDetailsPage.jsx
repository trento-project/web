import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { get } from 'lodash';

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
import { buildEnv } from '@lib/checks';
import { TARGET_CLUSTER } from '@lib/model';

import AscsErsClusterDetails from './AscsErsClusterDetails';
import HanaClusterDetails from './HanaClusterDetails';
import { getClusterName } from './ClusterLink';

export function ClusterDetailsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { clusterID } = useParams();

  const cluster = useSelector(getCluster(clusterID));

  const provider = get(cluster, 'provider');
  const type = get(cluster, 'type');

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
      ensa_version: ensaVersion,
      filesystem_type: filesystemType,
    });

    if (provider && type) {
      dispatch(updateCatalog(env));
      dispatch(updateLastExecution(clusterID));
    }
  }, [dispatch, provider, type, ensaVersion, filesystemType]);

  const clusterHosts = useSelector((state) =>
    getClusterHosts(state, clusterID)
  );

  const clusterSapSystems = useSelector((state) =>
    getClusterSapSystems(state, clusterID)
  );

  if (!cluster) {
    return <div>Loading...</div>;
  }

  const hasSelectedChecks = cluster.selected_checks.length > 0;

  switch (cluster.type) {
    case 'hana_scale_up':
    case 'hana_scale_out':
      return (
        <HanaClusterDetails
          clusterID={clusterID}
          userAbilities={abilities}
          clusterName={getClusterName(cluster)}
          selectedChecks={cluster.selected_checks}
          hasSelectedChecks={hasSelectedChecks}
          hosts={clusterHosts}
          clusterType={cluster.type}
          cibLastWritten={cluster.cib_last_written}
          sid={cluster.sid}
          provider={cluster.provider}
          sapSystems={clusterSapSystems}
          details={cluster.details}
          catalog={catalog}
          lastExecution={lastExecution}
          onStartExecution={(_, hostList, checks) =>
            dispatch(executionRequested(clusterID, hostList, checks))
          }
          navigate={navigate}
        />
      );
    case 'ascs_ers':
      return (
        <AscsErsClusterDetails
          clusterID={clusterID}
          userAbilities={abilities}
          clusterName={getClusterName(cluster)}
          selectedChecks={cluster.selected_checks}
          hasSelectedChecks={hasSelectedChecks}
          cibLastWritten={cluster.cib_last_written}
          provider={cluster.provider}
          hosts={clusterHosts}
          sapSystems={clusterSapSystems}
          details={cluster.details}
          catalog={catalog}
          lastExecution={lastExecution}
          onStartExecution={(_, hostList, checks) =>
            dispatch(executionRequested(clusterID, hostList, checks))
          }
          navigate={navigate}
        />
      );
    default:
      return <div>Unknown cluster type</div>;
  }
}
