import { recordSaga } from '@lib/test-utils';

import { clusterFactory } from '@lib/test-utils/factories';

import { clusterDeregistered, clusterRestored } from '@state/sagas/clusters';
import { removeCluster, appendCluster } from '@state/clusters';
import { notify } from '@state/actions/notifications';

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
});
