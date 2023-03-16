import {
  hostFactory,
  clusterFactory,
  catalogCheckFactory,
  checksExecutionCompletedFactory,
} from '@lib/test-utils/factories';
import { getLastExecution, getLastExecutionContext } from './lastExecutions';

describe('lastExecutions selector', () => {
  it('should return the expected last execution by group ID', () => {
    const state = {
      lastExecutions: {
        someID: {
          loading: false,
          data: {},
          error: null,
        },
      },
    };

    const expectedState = {
      loading: false,
      data: {},
      error: null,
    };

    expect(getLastExecution('someID')(state)).toEqual(expectedState);
  });

  it('should return the expected last execution context by group ID', () => {
    const aCluster = clusterFactory.build();
    const { id: clusterID, name: clusterName } = aCluster;

    const [
      { id: agent1, hostname: hostname1 },
      { id: agent2, hostname: hostname2 },
    ] = [
      hostFactory.build({ cluster_id: clusterID }),
      hostFactory.build({ cluster_id: clusterID }),
    ];

    const checksCatalog = catalogCheckFactory.buildList(3);

    const completedExecution = checksExecutionCompletedFactory.build();

    const state = {
      clustersList: {
        clusters: [aCluster, clusterFactory.build()],
      },
      hostsList: {
        hosts: [
          hostFactory.build({
            id: agent1,
            cluster_id: clusterID,
            hostname: hostname1,
          }),
          hostFactory.build({
            id: agent2,
            cluster_id: clusterID,
            hostname: hostname2,
          }),
          hostFactory.build(),
        ],
      },
      catalog: {
        loading: false,
        data: checksCatalog,
        error: null,
      },
      lastExecutions: {
        [clusterID]: {
          loading: false,
          data: completedExecution,
          error: null,
        },
      },
    };

    const { hostnames, cluster, catalog, lastExecution } =
      getLastExecutionContext(clusterID)(state);

    expect(hostnames).toEqual([
      { id: agent1, hostname: hostname1 },
      { id: agent2, hostname: hostname2 },
    ]);

    expect(cluster.name).toEqual(clusterName);
    expect(catalog.data.length).toEqual(checksCatalog.length);
    expect(lastExecution.data.result).toEqual(completedExecution.result);
  });
});
