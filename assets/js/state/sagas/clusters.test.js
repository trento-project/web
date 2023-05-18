import { recordSaga } from '@lib/test-utils';
import { clusterDeregistered } from '@state/sagas/clusters';
import { CLUSTER_DEREGISTERED, removeCluster } from '@state/clusters';
import { clusterFactory } from '@lib/test-utils/factories';

describe('Clusters sagas', () => {
  it('should remove the cluster', async () => {
    const { id, name } = clusterFactory.build();
    const payload = { id, name };

    const dispatched = await recordSaga(clusterDeregistered, {
      type: CLUSTER_DEREGISTERED,
      payload,
    });

    expect(dispatched).toContainEqual(removeCluster(payload));
  });
});
