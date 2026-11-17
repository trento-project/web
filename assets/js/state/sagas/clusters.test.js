// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: GPL-3.0-or-later

import { recordSaga } from '@lib/test-utils';

import {
  clusterFactory,
  hanaClusterHealthDetailsFactory,
  ascsErsClusterHealthDetailsFactory,
} from '@lib/test-utils/factories';

import {
  clusterDeregistered,
  clusterRestored,
  clusterHealthChanged,
  clusterHealthDetailsChanged,
} from '@state/sagas/clusters';
import {
  removeCluster,
  appendCluster,
  updateClusterHealth,
  updateClusterHealthDetails,
} from '@state/clusters';
import { notify } from '@state/notifications';

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

  it.each([
    {
      clusterType: 'hana_scale_up',
      healthDetailsFactory: hanaClusterHealthDetailsFactory,
    },
    {
      clusterType: 'ascs_ers',
      healthDetailsFactory: ascsErsClusterHealthDetailsFactory,
    },
  ])(
    'should update health details of a $clusterType cluster',
    async ({ clusterType, healthDetailsFactory }) => {
      const { id: cluster_id } = clusterFactory.build({ type: clusterType });
      const health_details = healthDetailsFactory.build();

      const dispatched = await recordSaga(clusterHealthDetailsChanged, {
        payload: { cluster_id, health_details },
      });

      expect(dispatched).toEqual([
        updateClusterHealthDetails({ cluster_id, health_details }),
      ]);
    }
  );
});
