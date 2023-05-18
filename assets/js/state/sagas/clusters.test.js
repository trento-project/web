import { recordSaga } from '@lib/test-utils';
import { clusterDeregistered } from '@state/sagas/clusters';
import { removeCluster } from '@state/clusters';
import { CLUSTER_DEREGISTERED } from '@state/actions/cluster';
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
