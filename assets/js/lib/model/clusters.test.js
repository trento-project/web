import {
  clusterFactory,
  clusteredSapInstanceFactory,
  hostFactory,
} from '@lib/test-utils/factories';

import {
  getClusterTypeLabel,
  isValidClusterType,
  getClusterSids,
  isSomeHostOnline,
} from './clusters';

describe('clusters', () => {
  it('should check if a cluster type is valid', () => {
    ['hana_scale_up', 'hana_scale_out', 'ascs_ers'].forEach((clusterType) => {
      expect(isValidClusterType(clusterType)).toBe(true);
    });

    expect(isValidClusterType('other')).toBe(false);
  });

  it('should provide a label for a cluster type', () => {
    [
      { key: 'hana_scale_up', label: 'HANA Scale Up' },
      { key: 'hana_scale_out', label: 'HANA Scale Out' },
      { key: 'ascs_ers', label: 'ASCS/ERS' },
    ].forEach(({ key, label }) => {
      expect(getClusterTypeLabel(key)).toBe(label);
    });

    expect(getClusterTypeLabel('other')).toBe('Unknown');
  });

  it('should get SAP instances SIDs from cluster', () => {
    const instance1 = clusteredSapInstanceFactory.build();
    const instance2 = clusteredSapInstanceFactory.build();
    const instance3 = clusteredSapInstanceFactory.build({ sid: instance1.sid });
    const cluster = clusterFactory.build({
      sap_instances: [instance1, instance2, instance3],
    });
    expect(getClusterSids(cluster)).toEqual([instance1.sid, instance2.sid]);
  });

  it('should return true if some hosts is online', () => {
    const hosts = [
      hostFactory.build({ cluster_host_status: 'online' }),
      hostFactory.build({ cluster_host_status: 'offline' }),
    ];
    expect(isSomeHostOnline(hosts)).toBeTruthy();
  });

  it('should return false if none of hosts are online', () => {
    const hosts = hostFactory.buildList(2, { cluster_host_status: 'offline' });
    expect(isSomeHostOnline(hosts)).toBeFalsy();
  });
});
