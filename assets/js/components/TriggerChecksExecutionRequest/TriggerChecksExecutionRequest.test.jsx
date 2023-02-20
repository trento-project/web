import React from 'react';

import { screen, act } from '@testing-library/react';
import { faker } from '@faker-js/faker';
import { renderWithRouter } from '@lib/test-utils';
import userEvent from '@testing-library/user-event';
import { hostFactory } from '@lib/test-utils/factories';

import TriggerChecksExecutionRequest from './TriggerChecksExecutionRequest';

describe('TriggerChecksExecutionRequest component', () => {
  it('should dispatch execution requested on click and navigate to the correct url', async () => {
    const user = userEvent.setup();

    const onStartExecution = jest.fn(
      (clusterId, _hosts, _selectedChecks, navigate) => {
        navigate(`/clusters/${clusterId}/executions/last`);
      }
    );

    const clusterId = faker.datatype.uuid();
    const hosts = hostFactory.buildList(2);
    const selectedChecks = [faker.datatype.uuid(), faker.datatype.uuid()];

    await act(async () =>
      renderWithRouter(
        <TriggerChecksExecutionRequest
          clusterId={clusterId}
          onStartExecution={onStartExecution}
          hosts={hosts}
          checks={selectedChecks}
        />
      )
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(onStartExecution).toHaveBeenCalledWith(
      clusterId,
      hosts,
      selectedChecks,
      expect.any(Function)
    );
    expect(window.location.pathname).toBe(
      `/clusters/${clusterId}/executions/last`
    );
  });
});
