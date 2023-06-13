import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import {
  getCluster,
  getClusterHosts,
  getClusterSapSystems,
} from '@state/selectors/cluster';
import {
  updateLastExecution,
  executionRequested,
} from '@state/actions/lastExecutions';
import { getLastExecution } from '@state/selectors/lastExecutions';
import AscsErsClusterDetails from './AscsErsClusterDetails';
import HanaClusterDetails from './HanaClusterDetails';
import { getClusterName } from '../ClusterLink';

export function ClusterDetailsPage() {
  const { clusterID } = useParams();
  const navigate = useNavigate();

  const cluster = useSelector(getCluster(clusterID));

  const dispatch = useDispatch();
  const lastExecution = useSelector(getLastExecution(clusterID));
  useEffect(() => {
    dispatch(updateLastExecution(clusterID));
  }, [dispatch]);

  const clusterHosts = useSelector(getClusterHosts(clusterID));

  const clusterSapSystems = useSelector(getClusterSapSystems(clusterID));

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
          clusterName={getClusterName(cluster)}
          selectedChecks={cluster.selected_checks}
          hasSelectedChecks={hasSelectedChecks}
          hosts={clusterHosts}
          clusterType={cluster.type}
          cibLastWritten={cluster.cib_last_written}
          sid={cluster.sid}
          provider={cluster.provider}
          details={cluster.details}
          lastExecution={lastExecution}
          onStartExecution={(_, hostList, checks, navigateFunction) =>
            dispatch(
              executionRequested(clusterID, hostList, checks, navigateFunction)
            )
          }
          navigate={navigate}
        />
      );
    case 'ascs_ers':
      return (
        <AscsErsClusterDetails
          clusterName={getClusterName(cluster)}
          cibLastWritten={cluster.cib_last_written}
          provider={cluster.provider}
          hosts={clusterHosts}
          sapSystems={clusterSapSystems}
          details={cluster.details}
        />
      );
    default:
      return <div>Unknown cluster type</div>;
  }
}
