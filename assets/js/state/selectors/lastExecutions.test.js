import {
  hostFactory,
  clusterFactory,
  catalogCheckFactory,
  checksExecutionCompletedForTargetsFactory,
  checksExecutionRunningFactory,
} from '@lib/test-utils/factories';
import { getLastExecution, getLastExecutionData } from './lastExecutions';

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

    const hostsList = [
      hostFactory.build({ cluster_id: clusterID }),
      hostFactory.build({ cluster_id: clusterID }),
    ];

    const [
      { id: agent1, hostname: hostname1 },
      { id: agent2, hostname: hostname2 },
    ] = hostsList;

    const checksCatalog = catalogCheckFactory.buildList(3);

    const completedExecution = checksExecutionCompletedForTargetsFactory.build({
      targets: [agent1, agent2],
    });

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

    const { clusterHosts, cluster, catalog, lastExecution } =
      getLastExecutionData(clusterID)(state);

    expect(clusterHosts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: agent1, hostname: hostname1 }),
        expect.objectContaining({ id: agent2, hostname: hostname2 }),
      ])
    );

    expect(cluster.name).toEqual(clusterName);
    expect(catalog.data.length).toEqual(checksCatalog.length);
    expect(lastExecution.data.result).toEqual(completedExecution.result);
    expect(
      lastExecution.data.check_results[0].agents_check_results[0].hostname
    ).toEqual(hostname1);
    expect(
      lastExecution.data.check_results[0].agents_check_results[1].hostname
    ).toEqual(hostname2);
  });

  it('should properly handle running executions', () => {
    const { id: clusterID } = clusterFactory.build();
    const runningExecution = checksExecutionRunningFactory.build({
      group_id: clusterID,
    });

    const state = {
      clustersList: {
        clusters: [],
      },
      hostsList: {
        hosts: [],
      },
      catalog: {},
      lastExecutions: {
        [clusterID]: {
          loading: false,
          data: runningExecution,
          error: null,
        },
      },
    };

    const { lastExecution } = getLastExecutionData(clusterID)(state);

    expect(lastExecution.data.result).toBeNull();
    expect(lastExecution.data.check_results).toBeUndefined();
    expect(lastExecution.data.status).toEqual('running');
  });
});
