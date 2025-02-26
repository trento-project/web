import MockAdapter from 'axios-mock-adapter';
import { faker } from '@faker-js/faker';

import { recordSaga } from '@lib/test-utils';
import { networkClient } from '@lib/network';

import {
  removeRunningOperation,
  setRunningOperation,
} from '@state/runningOperations';
import { notify } from '@state/notifications';

import { requestOperation, completeOperation } from './operations';

const axiosMock = new MockAdapter(networkClient);
const hostOperationRequestURL = (hostID, operation) =>
  `/hosts/${hostID}/operations/${operation}`;

describe('operations saga', () => {
  beforeEach(() => {
    axiosMock.reset();
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  afterEach(() => {
    /* eslint-disable-next-line */
    console.error.mockRestore();
  });

  it('should request an operation', async () => {
    const groupID = faker.string.uuid();
    const operation = faker.lorem.word();
    const hostname = faker.internet.displayName();

    axiosMock.onGet(hostOperationRequestURL(groupID)).reply(202, {});

    const dispatched = await recordSaga(
      requestOperation,
      {
        payload: { groupID, operation },
      },
      { hostsList: [{ id: groupID, hostname }] }
    );

    expect(dispatched).toContainEqual(
      setRunningOperation({ groupID, operation }),
      notify({
        text: `Operation ${operation} requested for ${hostname}`,
        icon: '⚙️',
      })
    );
  });

  it('should fail requesting an operation if the api request fails', async () => {
    const groupID = faker.string.uuid();
    const operation = faker.lorem.word();
    const hostname = faker.internet.displayName();

    axiosMock.onGet(hostOperationRequestURL(groupID)).reply(404, {});

    const dispatched = await recordSaga(
      requestOperation,
      {
        payload: { groupID, operation },
      },
      { hostsList: [{ id: groupID, hostname }] }
    );

    expect(dispatched).toContainEqual(
      setRunningOperation({ groupID, operation }),
      removeRunningOperation({ groupID }),
      notify({
        text: `Operation ${operation} request for ${hostname} failed`,
        icon: '❌',
      })
    );
  });

  it('should complete successfully an operation', async () => {
    const groupID = faker.string.uuid();
    const operation = faker.lorem.word();
    const hostname = faker.internet.displayName();

    const dispatched = await recordSaga(
      completeOperation,
      {
        payload: { groupID, operation, result: 'UPDATED' },
      },
      { hostsList: [{ id: groupID, hostname }] }
    );

    expect(dispatched).toContainEqual(
      removeRunningOperation({ groupID }),
      notify({
        text: `Operation ${operation} succeeded for ${hostname}`,
        icon: '✅',
      })
    );
  });

  it('should complete an operation with a failed result', async () => {
    const groupID = faker.string.uuid();
    const operation = faker.lorem.word();
    const hostname = faker.internet.displayName();

    const dispatched = await recordSaga(
      completeOperation,
      {
        payload: { groupID, operation, result: 'FAILED' },
      },
      { hostsList: [{ id: groupID, hostname }] }
    );

    expect(dispatched).toContainEqual(
      removeRunningOperation({ groupID }),
      notify({
        text: `Operation ${operation} failed for ${hostname}`,
        icon: '❌',
      })
    );
  });
});
