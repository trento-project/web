import { getClusterTypeLabel, isValidClusterType } from './clusters';

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
});
