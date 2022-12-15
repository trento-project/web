import React from 'react';

import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { withState, renderWithRouter } from '@lib/test-utils';

import TriggerChecksExecutionRequest from './TriggerChecksExecutionRequest';

describe('TriggerChecksExecutionRequest', () => {
  it('should dispatch execution requested on click', async () => {
    const user = userEvent.setup();

    const initialState = {
      clustersList: {
        clusters: [
          {
            id: 'cluster1',
            selected_checks: ['check1', 'check3'],
          },
          {
            id: 'cluster2',
            selected_checks: ['check3', 'check4'],
          },
        ],
      },
      hostsList: {
        hosts: [
          {
            id: 'host1',
            cluster_id: 'cluster1',
          },
          {
            id: 'host2',
            cluster_id: 'cluster1',
          },
          {
            id: 'host3',
            cluster_id: 'cluster2',
          },
        ],
      },
    };

    const [statefulView, store] = withState(
      <TriggerChecksExecutionRequest clusterId="cluster1" usingWanda />,
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
          clusterID: 'cluster1',
          hosts: ['host1', 'host2'],
          checks: ['check1', 'check3'],
        },
      },
    ];
    expect(actions).toEqual(expectedActions);
  });
});
