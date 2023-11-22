import { recordSaga } from '@lib/test-utils';

import { clusterFactory } from '@lib/test-utils/factories';

import {
  clusterDeregistered,
  clusterRestored,
  clusterHealthChanged,
} from '@state/sagas/clusters';
import {
  removeCluster,
  appendCluster,
  updateClusterHealth,
} from '@state/clusters';
import { notify } from '@state/sagas/notifications';

describe('Clusters sagas', () => {
  it('should remove the cluster', async () => {
    const { id, name } = clusterFactory.build();

    const dispatched = await recordSaga(clusterDeregistered, {
      payload: { id, name },
    });

    expect(dispatched).toContainEqual(removeCluster({ id }));
  });

  it('should restore the cluster', async () => {
    const payload = clusterFactory.build();

    const dispatched = await recordSaga(clusterRestored, { payload });

    expect(dispatched).toEqual([
      appendCluster(payload),
      notify({
        text: `Cluster ${payload.name} has been restored.`,
        icon: 'ℹ️',
      }),
    ]);
  });

  it('should update health status of a cluster', async () => {
    const { id: cluster_id, name, health } = clusterFactory.build();

    const dispatched = await recordSaga(clusterHealthChanged, {
      payload: { cluster_id, name, health },
    });

    expect(dispatched).toEqual([
      updateClusterHealth({ cluster_id, name, health }),
      notify({
        text: `Cluster ${name} health changed to ${health}.`,
        icon: 'ℹ️',
      }),
    ]);
  });
});
