import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';
import { faker } from '@faker-js/faker';
import { act, renderHook } from '@testing-library/react';
import { hookWrapperWithState } from '@lib/test-utils';
import { selectableCheckFactory } from '@lib/test-utils/factories';
import { useChecksSelection } from './hooks';

const axiosMock = new MockAdapter(networkClient);

describe('useChecksSelection', () => {
  afterEach(() => {
    axiosMock.reset();
  });

  it('should return default state', async () => {
    let hookResult;
    const [hookWrapper, _] = hookWrapperWithState();

    await act(async () => {
      const { result } = renderHook(() => useChecksSelection(), {
        wrapper: hookWrapper,
      });
      hookResult = result;
    });
    expect(hookResult.current.checksSelectionLoading).toBe(false);
    expect(hookResult.current.checksSelection).toEqual([]);
    expect(hookResult.current.checksSelectionFetchError).toEqual(null);
  });

  it.each`
    statusCode | expectedError
    ${500}     | ${'Request failed with status code 500'}
    ${404}     | ${'Request failed with status code 404'}
    ${400}     | ${'Request failed with status code 400'}
  `(
    'should handle failures while fetching checks selection',
    async ({ statusCode, expectedError }) => {
      let hookResult;
      const [hookWrapper, _] = hookWrapperWithState();

      const groupId = faker.string.uuid();

      await act(async () => {
        const { result } = renderHook(() => useChecksSelection(), {
          wrapper: hookWrapper,
        });
        hookResult = result;
      });

      axiosMock.onGet(`/api/v1/groups/${groupId}/checks`).reply(statusCode);

      await act(async () => {
        hookResult.current.fetchChecksSelection(groupId);
      });

      expect(hookResult.current.checksSelectionLoading).toBe(false);
      expect(hookResult.current.checksSelection).toEqual([]);
      expect(hookResult.current.checksSelectionFetchError).toEqual(
        expectedError
      );
    }
  );

  it('should successfully fetch checks selection', async () => {
    let hookResult;
    const [hookWrapper, _] = hookWrapperWithState();

    const groupId = faker.string.uuid();

    const checksSelection = selectableCheckFactory.buildList(3);

    await act(async () => {
      const { result } = renderHook(() => useChecksSelection(), {
        wrapper: hookWrapper,
      });
      hookResult = result;
    });

    axiosMock
      .onGet(`/api/v1/groups/${groupId}/checks`)
      .reply(200, { items: checksSelection });

    await act(async () => {
      hookResult.current.fetchChecksSelection(groupId);
    });

    expect(hookResult.current.checksSelectionLoading).toBe(false);
    expect(hookResult.current.checksSelection).toEqual(checksSelection);
    expect(hookResult.current.checksSelectionFetchError).toEqual(null);
  });

  it.each([400, 404, 500, 503])(
    'should handle failures while resetting check customization',
    async (statusCode) => {
      let hookResult;
      const [hookWrapper, store] = hookWrapperWithState();

      const checksSelection = selectableCheckFactory.buildList(3, {
        customized: true,
      });
      const groupId = faker.string.uuid();
      const checkId = checksSelection[0].id;

      await act(async () => {
        const { result } = renderHook(() => useChecksSelection(), {
          wrapper: hookWrapper,
        });
        hookResult = result;
      });

      axiosMock
        .onDelete(`/api/v1/groups/${groupId}/checks/${checkId}/customization`)
        .reply(statusCode);

      await act(async () => {
        hookResult.current.resetChecksCustomization(groupId, checkId);
      });

      const updatedChecksSelection = hookResult.current.checksSelection;

      updatedChecksSelection.forEach(({ customized }) =>
        expect(customized).toBe(true)
      );

      expect(store.getActions()).toEqual([
        {
          type: 'NOTIFICATION',
          payload: { text: `Unable to reset customization`, icon: '❌' },
        },
      ]);
    }
  );

  it('should successfully reset check customization', async () => {
    let hookResult;
    const [hookWrapper, store] = hookWrapperWithState();

    const checksSelection = selectableCheckFactory.buildList(3, {
      customized: true,
    });
    const groupId = faker.string.uuid();
    const checkId = checksSelection[0].id;

    await act(async () => {
      const { result } = renderHook(() => useChecksSelection(), {
        wrapper: hookWrapper,
      });
      hookResult = result;
    });

    axiosMock
      .onDelete(`/api/v1/groups/${groupId}/checks/${checkId}/customization`)
      .reply(204);

    await act(async () => {
      hookResult.current.resetChecksCustomization(groupId, checkId);
    });

    const updatedChecksSelection = hookResult.current.checksSelection;

    updatedChecksSelection.forEach(({ id, customized }) => {
      if (id === checkId) {
        expect(customized).toBe(false);
      } else {
        expect(customized).toBe(true);
      }
    });

    expect(store.getActions()).toEqual([
      {
        type: 'NOTIFICATION',
        payload: { text: `Customization was reset!`, icon: '✅' },
      },
    ]);
  });
});
