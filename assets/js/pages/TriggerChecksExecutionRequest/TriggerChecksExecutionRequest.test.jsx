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

    const onStartExecution = jest.fn();

    const targetID = faker.string.uuid();
    const hosts = hostFactory.buildList(2);
    const selectedChecks = [faker.string.uuid(), faker.string.uuid()];

    await act(async () =>
      renderWithRouter(
        <TriggerChecksExecutionRequest
          targetID={targetID}
          onStartExecution={onStartExecution}
          hosts={hosts}
          checks={selectedChecks}
        />
      )
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(onStartExecution).toHaveBeenCalledWith(
      targetID,
      hosts,
      selectedChecks
    );
  });
});
