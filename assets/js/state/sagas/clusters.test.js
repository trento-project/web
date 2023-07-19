import { recordSaga } from '@lib/test-utils';

import { clusterFactory } from '@lib/test-utils/factories';

import { clusterDeregistered } from '@state/sagas/clusters';
import { removeCluster } from '@state/clusters';

describe('Clusters sagas', () => {
  it('should remove the cluster', async () => {
    const { id, name } = clusterFactory.build();

    const dispatched = await recordSaga(clusterDeregistered, {
      payload: { id, name },
    });

    expect(dispatched).toContainEqual(removeCluster({ id }));
  });
});
