import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import {
  getCluster,
  getClusterHosts,
  getClusterHostIDs,
} from '@state/selectors/cluster';
import {
  updateLastExecution,
  executionRequested,
} from '@state/actions/lastExecutions';
import { getLastExecution } from '@state/selectors/lastExecutions';
import { ClusterDetails } from './ClusterDetails';
import { getClusterName } from '../ClusterLink';

export function ClusterDetailsPage() {
  const { clusterID } = useParams();
  const navigate = useNavigate();

  const cluster = useSelector(getCluster(clusterID));

  const dispatch = useDispatch();
  const lastExecution = useSelector(getLastExecution(clusterID));
  const hosts = useSelector(getClusterHostIDs(clusterID));
  useEffect(() => {
    dispatch(updateLastExecution(clusterID));
  }, [dispatch]);

  const clusterHosts = useSelector(getClusterHosts(clusterID));

  if (!cluster) {
    return <div>Loading...</div>;
  }

  const renderedNodes = cluster.details?.nodes?.map((node) => ({
    ...node,
    ...clusterHosts.find(({ hostname }) => hostname === node.name),
  }));

  const hasSelectedChecks = cluster.selected_checks.length > 0;

  return (
    <ClusterDetails
      clusterID={clusterID}
      clusterName={getClusterName(clusterID)}
      selectedChecks={cluster.selected_checks}
      hasSelectedChecks={hasSelectedChecks}
      hosts={hosts}
      clusterType={cluster.type}
      cibLastWritten={cluster.cib_last_written}
      sid={cluster.sid}
      provider={cluster.provider}
      clusterNodes={renderedNodes}
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
}
