import React from 'react';

import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { faker } from '@faker-js/faker';
import { withState, renderWithRouter } from '@lib/test-utils';

import { clusterFactory, hostFactory } from '@lib/test-utils/factories';

import TriggerChecksExecutionRequest from './TriggerChecksExecutionRequest';

describe('TriggerChecksExecutionRequest', () => {
  it('should dispatch execution requested on click', async () => {
    const user = userEvent.setup();
    const cluster1 = clusterFactory.build({
      selected_checks: [faker.datatype.uuid(), faker.datatype.uuid()],
    });
    const cluster2 = clusterFactory.build({
      selected_checks: [faker.datatype.uuid(), faker.datatype.uuid()],
    });
    const { id: clusterID1, selected_checks: clusterSelectedChecks1 } =
      cluster1;
    const { id: clusterID2 } = cluster2;

    const host1 = hostFactory.build({ cluster_id: clusterID1 });
    const host2 = hostFactory.build({ cluster_id: clusterID1 });
    const host3 = hostFactory.build({ cluster_id: clusterID2 });
    const { id: hostID1 } = host1;
    const { id: hostID2 } = host2;

    const initialState = {
      clustersList: {
        clusters: [cluster1, cluster2],
      },
      hostsList: {
        hosts: [host1, host2, host3],
      },
    };

    const [statefulView, store] = withState(
      <TriggerChecksExecutionRequest clusterId={clusterID1} usingWanda />,
      initialState
    );

    await act(async () => renderWithRouter(statefulView));

    const button = screen.getByRole('button');
    await user.click(button);

    const actions = store.getActions();
    const expectedActions = [
      {
        type: 'EXECUTION_REQUESTED',
        payload: {
          clusterID: clusterID1,
          hosts: [hostID1, hostID2],
          checks: clusterSelectedChecks1,
        },
      },
    ];
    expect(actions).toEqual(expectedActions);
  });
});
