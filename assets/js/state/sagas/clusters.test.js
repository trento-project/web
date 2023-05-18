import { recordSaga } from '@lib/test-utils';
import { clusterDeregistered } from '@state/sagas/clusters';
import { removeCluster } from '@state/clusters';

describe('Clusters sagas', () => {
  it('should trigger reducer to remove cluster', async () => {
    const payload = {
      name: 'test-cluster',
      id: 'test-cluster-id',
    };

    const dispatched = await recordSaga(clusterDeregistered, {
      type: 'CLUSTER_DEREGISTERED',
      payload,
    });

    expect(dispatched).toContainEqual(removeCluster(payload));
  });
});
