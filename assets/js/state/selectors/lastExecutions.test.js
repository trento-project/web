import {
  hostFactory,
  clusterFactory,
  catalogCheckFactory,
  checksExecutionCompletedForTargetsFactory,
  checksExecutionRunningFactory,
} from '@lib/test-utils/factories';
import { faker } from '@faker-js/faker';
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

  it('should return the expected cluster last execution data by group ID', () => {
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

    const { targetHosts, target, catalog, lastExecution } =
      getLastExecutionData(state, clusterID, 'cluster');

    expect(targetHosts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: agent1, hostname: hostname1 }),
        expect.objectContaining({ id: agent2, hostname: hostname2 }),
      ])
    );

    expect(target.name).toEqual(clusterName);
    expect(catalog.data.length).toEqual(checksCatalog.length);
    expect(lastExecution.data.result).toEqual(completedExecution.result);
    expect(
      lastExecution.data.check_results[0].agents_check_results[0].hostname
    ).toEqual(hostname1);
    expect(
      lastExecution.data.check_results[0].agents_check_results[1].hostname
    ).toEqual(hostname2);
  });

  it('should return the expected host last execution data by group ID', () => {
    const aCluster = clusterFactory.build();
    const { id: clusterID } = aCluster;

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
      targets: [agent1],
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
        [agent1]: {
          loading: false,
          data: completedExecution,
          error: null,
        },
      },
    };

    const { targetHosts, target, catalog, lastExecution } =
      getLastExecutionData(state, agent1, 'host');

    expect(targetHosts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: agent1, hostname: hostname1 }),
      ])
    );

    expect(target.hostname).toEqual(hostname1);
    expect(catalog.data.length).toEqual(checksCatalog.length);
    expect(lastExecution.data.result).toEqual(completedExecution.result);
    expect(
      lastExecution.data.check_results[0].agents_check_results[0].hostname
    ).toEqual(hostname1);
  });

  it('should properly handle running executions', () => {
    const groupID = faker.datatype.uuid();
    const runningExecution = checksExecutionRunningFactory.build({
      group_id: groupID,
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
        [groupID]: {
          loading: false,
          data: runningExecution,
          error: null,
        },
      },
    };

    ['cluster', 'host'].forEach(({ targetType }) => {
      const { lastExecution } = getLastExecutionData(
        state,
        groupID,
        targetType
      );

      expect(lastExecution.data.result).toBeNull();
      expect(lastExecution.data.check_results).toBeUndefined();
      expect(lastExecution.data.status).toEqual('running');
    });
  });
});
