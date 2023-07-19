import { faker } from '@faker-js/faker';
import { recordSaga } from '@lib/test-utils';

import { networkClient } from '@lib/network';
import MockAdapter from 'axios-mock-adapter';

import { hostFactory, clusterFactory } from '@lib/test-utils/factories';

import { updateSelectedChecks as updateHostSelectedChecks } from '@state/hosts';
import { updateSelectedChecks as updateClusterSelectedChecks } from '@state/clusters';

import {
  startSavingChecksSelection,
  setSavingSuccessful,
  setSavingFailed,
} from '@state/checksSelection';

import { notify } from '@state/actions/notifications';

import { selectHostChecks, selectClusterChecks } from './checksSelection';

const axiosMock = new MockAdapter(networkClient);

describe('Checks Selection saga', () => {
  describe('Host Checks Selection', () => {
    it('should successfully save check selection for a host', async () => {
      const { id: hostID, hostname: hostName } = hostFactory.build();
      const checks = [faker.datatype.uuid(), faker.datatype.uuid()];

      axiosMock.onPost(`/hosts/${hostID}/checks`).reply(202, {});

      const dispatched = await recordSaga(selectHostChecks, {
        payload: {
          hostID,
          hostName,
          checks,
        },
      });

      const payload = {
        targetID: hostID,
        targetType: 'host',
      };

      expect(dispatched).toEqual([
        startSavingChecksSelection(payload),
        updateHostSelectedChecks({
          hostID,
          checks,
        }),
        setSavingSuccessful(payload),
        notify({
          text: `Checks selection for ${hostName} saved`,
          icon: '💾',
        }),
      ]);
    });

    it('should not save check selection for a host on request failure', async () => {
      const { id: hostID, hostname: hostName } = hostFactory.build();
      const checks = [faker.datatype.uuid(), faker.datatype.uuid()];

      axiosMock.onPost(`/hosts/${hostID}/checks`).reply(400, {});

      const dispatched = await recordSaga(selectHostChecks, {
        payload: {
          hostID,
          hostName,
          checks,
        },
      });

      const payload = {
        targetID: hostID,
        targetType: 'host',
      };

      expect(dispatched).toEqual([
        startSavingChecksSelection(payload),
        setSavingFailed(payload),
        notify({
          text: `Unable to save selection for ${hostName}`,
          icon: '❌',
        }),
      ]);
    });
  });

  describe('Cluster Checks Selection', () => {
    it('should successfully save check selection for a cluster', async () => {
      const { id: clusterID, name: clusterName } = clusterFactory.build();
      const checks = [faker.datatype.uuid(), faker.datatype.uuid()];

      axiosMock.onPost(`/clusters/${clusterID}/checks`).reply(202, {});

      const dispatched = await recordSaga(selectClusterChecks, {
        payload: {
          clusterID,
          clusterName,
          checks,
        },
      });

      const payload = {
        targetID: clusterID,
        targetType: 'cluster',
      };

      expect(dispatched).toEqual([
        startSavingChecksSelection(payload),
        updateClusterSelectedChecks({
          clusterID,
          checks,
        }),
        setSavingSuccessful(payload),
        notify({
          text: `Checks selection for ${clusterName} saved`,
          icon: '💾',
        }),
      ]);
    });

    it('should not save check selection for a cluster on request failure', async () => {
      const { id: clusterID, name: clusterName } = clusterFactory.build();
      const checks = [faker.datatype.uuid(), faker.datatype.uuid()];

      axiosMock.onPost(`/clusters/${clusterID}/checks`).reply(400, {});

      const dispatched = await recordSaga(selectClusterChecks, {
        payload: {
          clusterID,
          clusterName,
          checks,
        },
      });

      const payload = {
        targetID: clusterID,
        targetType: 'cluster',
      };

      expect(dispatched).toEqual([
        startSavingChecksSelection(payload),
        setSavingFailed(payload),
        notify({
          text: `Unable to save selection for ${clusterName}`,
          icon: '❌',
        }),
      ]);
    });
  });
});
