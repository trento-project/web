import React from 'react';

import { screen, act } from '@testing-library/react';
import { faker } from '@faker-js/faker';
import { renderWithRouter } from '@lib/test-utils';
import userEvent from '@testing-library/user-event';
import { hostFactory } from '@lib/test-utils/factories';

import { ChecksExecutionContext } from '@components/ChecksExecutionContext';
import TriggerChecksExecutionRequest from './TriggerChecksExecutionRequest';

describe('TriggerChecksExecutionRequest component', () => {
  it('should dispatch execution requested on click and navigate to the correct url', async () => {
    const user = userEvent.setup();
    const handleExecutionStart = jest.fn();
    const clusterId = faker.datatype.uuid();
    const hosts = hostFactory.buildList(2);
    const selectedChecks = [faker.datatype.uuid(), faker.datatype.uuid()];

    await act(async () =>
      renderWithRouter(
        <ChecksExecutionContext.Provider value={handleExecutionStart}>
          <TriggerChecksExecutionRequest
            clusterId={clusterId}
            hosts={hosts}
            checks={selectedChecks}
          />
        </ChecksExecutionContext.Provider>
      )
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleExecutionStart).toHaveBeenCalledWith(
      clusterId,
      hosts,
      selectedChecks
    );
    expect(window.location.pathname).toBe(
      `/clusters/${clusterId}/executions/last`
    );
  });
});
