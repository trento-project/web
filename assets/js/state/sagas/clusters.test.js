import { faker } from '@faker-js/faker';
import MockAdapter from 'axios-mock-adapter';
import { recordSaga } from '@lib/test-utils';

import { networkClient } from '@lib/network';

import { clusterFactory } from '@lib/test-utils/factories';

import { notify } from '@state/actions/notifications';
import { clusterDeregistered, checksSelected } from '@state/sagas/clusters';
import { removeCluster, updateSelectedChecks } from '@state/clusters';

import {
  setClusterChecksSelectionSavingError,
  setClusterChecksSelectionSavingSuccess,
  startSavingClusterChecksSelection,
  stopSavingClusterChecksSelection,
} from '@state/clusterChecksSelection';

const axiosMock = new MockAdapter(networkClient);

describe('Clusters sagas', () => {
  it('should remove the cluster', async () => {
    const { id, name } = clusterFactory.build();

    const dispatched = await recordSaga(clusterDeregistered, {
      payload: { id, name },
    });

    expect(dispatched).toContainEqual(removeCluster({ id }));
  });

  it('should save check selection for a cluster', async () => {
    const cluster = clusterFactory.build();

    axiosMock.onPost(`/clusters/${cluster.id}/checks`).reply(202, {});

    const actionPayload = {
      clusterID: cluster.id,
      checks: [faker.datatype.uuid(), faker.datatype.uuid()],
    };
    const dispatched = await recordSaga(
      checksSelected,
      {
        payload: actionPayload,
      },
      {
        clustersList: { clusters: [cluster] },
      }
    );

    expect(dispatched).toEqual([
      startSavingClusterChecksSelection(),
      updateSelectedChecks(actionPayload),
      notify({
        text: `Checks selection for ${cluster.name} saved`,
        icon: '💾',
      }),
      setClusterChecksSelectionSavingSuccess(),
      stopSavingClusterChecksSelection(),
    ]);
  });

  it('should notify an error when saving a cluster check selection fails', async () => {
    const cluster = clusterFactory.build();

    axiosMock.onPost(`/clusters/${cluster.id}/checks`).reply(400, {});

    const actionPayload = {
      clusterID: cluster.id,
      checks: [faker.datatype.uuid(), faker.datatype.uuid()],
    };
    const dispatched = await recordSaga(
      checksSelected,
      {
        payload: actionPayload,
      },
      {
        clustersList: { clusters: [cluster] },
      }
    );

    expect(dispatched).toEqual([
      startSavingClusterChecksSelection(),
      notify({
        text: `Unable to save selection for ${cluster.name}`,
        icon: '❌',
      }),
      setClusterChecksSelectionSavingError(),
      stopSavingClusterChecksSelection(),
    ]);
  });
});
