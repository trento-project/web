import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { faker } from '@faker-js/faker';

import '@testing-library/jest-dom';
import { renderWithRouterMatch, withState } from '@lib/test-utils';
import {
  clusterFactory,
  hostFactory,
  catalogCheckFactory,
  checksExecutionCompletedForTargetsFactory,
} from '@lib/test-utils/factories';

import CheckResultDetailPage from '.';

describe('CheckResultDetailPage Component', () => {
  const initialStore = () => {
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
      targets: [agent1, agent2],
      check_id: [checksCatalog[0].id, checksCatalog[1].id],
    });

    const initialState = {
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
    return initialState;
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should not render CheckResultDetailPage when clusterID in the url is false', () => {
    const reduxStore = initialStore();
    const falseClusterID = faker.animal.bear();
    const [StatefulCheckResultDetailPage] = withState(
      <CheckResultDetailPage />,
      reduxStore
    );
    renderWithRouterMatch(StatefulCheckResultDetailPage, {
      path: 'clusters/:clusterID/executions/last/:checkID/:targetType/:targetName',
      route: `/clusters/${falseClusterID}/executions/last/${reduxStore.catalog.data[0].id}/host/${reduxStore.hostsList.hosts[0].hostname}`,
    });

    expect(screen.getByText('Go back to cluster overview')).toBeTruthy();
    fireEvent.click(screen.getByText('Go back to cluster overview'));
    expect(window.location.pathname).toEqual('/clusters/');
  });

  it('should not render CheckResultDetailPage when checkID in the url is false', () => {
    const reduxStore = initialStore();
    const falseCheckID = faker.animal.bear();
    const [StatefulCheckResultDetailPage] = withState(
      <CheckResultDetailPage />,
      reduxStore
    );

    renderWithRouterMatch(StatefulCheckResultDetailPage, {
      path: 'clusters/:clusterID/executions/last/:checkID/:targetType/:targetName',
      route: `/clusters/${reduxStore.clustersList.clusters[0].id}/executions/last/${falseCheckID}/host/${reduxStore.hostsList.hosts[0].hostname}`,
    });

    expect(screen.getByText('Go back to last execution')).toBeTruthy();
    fireEvent.click(screen.getByText('Go back to last execution'));
    expect(window.location.pathname).toEqual(
      `/clusters/${reduxStore.clustersList.clusters[0].id}/executions/last`
    );
  });
  it('should not render CheckResultDetailPage when targetType in the url is false', () => {
    const reduxStore = initialStore();
    const invalidTargetType = 'falseTargetType';
    const [StatefulCheckResultDetailPage] = withState(
      <CheckResultDetailPage />,
      reduxStore
    );
    renderWithRouterMatch(StatefulCheckResultDetailPage, {
      path: 'clusters/:clusterID/executions/last/:checkID/:targetType/:targetName',
      route: `/clusters/${reduxStore.clustersList.clusters[0].id}/executions/last/${reduxStore.catalog.data[0].id}/${invalidTargetType}/${reduxStore.hostsList.hosts[0].hostname}`,
    });
    expect(screen.getByText('Go back to last execution')).toBeTruthy();
    fireEvent.click(screen.getByText('Go back to last execution'));
    expect(window.location.pathname).toEqual(
      `/clusters/${reduxStore.clustersList.clusters[0].id}/executions/last`
    );
  });

  it('should not render CheckResultDetailPage when targetName in the url is false', () => {
    const reduxStore = initialStore();
    const invalidTargetName = faker.random.word();
    const [StatefulCheckResultDetailPage] = withState(
      <CheckResultDetailPage />,
      reduxStore
    );
    renderWithRouterMatch(StatefulCheckResultDetailPage, {
      path: 'clusters/:clusterID/executions/last/:checkID/:targetType/:targetName',
      route: `/clusters/${reduxStore.clustersList.clusters[0].id}/executions/last/${reduxStore.catalog.data[0].id}/host/${invalidTargetName}`,
    });
    expect(screen.getByText('Go back to last execution')).toBeTruthy();
    fireEvent.click(screen.getByText('Go back to last execution'));
    expect(window.location.pathname).toEqual(
      `/clusters/${reduxStore.clustersList.clusters[0].id}/executions/last`
    );
  });

  it('should render CheckResultDetailPage when the parts of url [ClusterID, CheckID, TargetType, TargetName] are valid', () => {
    const reduxStore = initialStore();
    const validClusterID = reduxStore.clustersList.clusters[0].id;
    const validCheckID = reduxStore.catalog.data[0].id;
    const validTargetType = 'host';
    const validTargetName = reduxStore.hostsList.hosts[0].hostname;
    const [StatefulCheckResultDetailPage] = withState(
      <CheckResultDetailPage />,
      reduxStore
    );
    renderWithRouterMatch(StatefulCheckResultDetailPage, {
      path: 'clusters/:clusterID/executions/last/:checkID/:targetType/:targetName',
      route: `/clusters/${validClusterID}/executions/last/${validCheckID}/${validTargetType}/${validTargetName}`,
    });

    expect(screen.getByText('Check ID')).toBeInTheDocument();
    expect(screen.getByText(validCheckID)).toBeInTheDocument();
    expect(screen.getByText('Host')).toBeInTheDocument();
    expect(screen.getByText(validTargetName)).toBeInTheDocument();
  });
});
