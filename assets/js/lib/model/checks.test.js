import { TARGET_CLUSTER, TARGET_HOST } from '@lib/model';
import { HANA_SCALE_UP, HANA_SCALE_OUT, ASCS_ERS } from '@lib/model/clusters';
import { hasChecksForClusterType, hasChecksForTarget } from './checks';

describe('checks model', () => {
  const hasChecksForTargetScenarios = [
    {
      catalog: [
        { metadata: { target_type: 'host' } },
        { metadata: { target_type: 'cluster' } },
        { metadata: { target_type: 'acme' } },
        { metadata: {} },
        { check_id: '1' },
      ],
      expectations: {
        host: true,
        cluster: true,
      },
    },
    {
      catalog: [{ metadata: { target_type: 'acme' } }],
      expectations: {
        host: false,
        cluster: false,
      },
    },
    {
      catalog: [{ metadata: {} }, { check_id: '1' }],
      expectations: {
        host: true,
        cluster: true,
      },
    },
  ];
  it.each(hasChecksForTargetScenarios)(
    'should check if catalog has checks for a target type',
    ({ catalog, expectations }) => {
      [TARGET_HOST, TARGET_CLUSTER].forEach((targetType) => {
        expect(hasChecksForTarget(catalog, targetType)).toBe(
          expectations[targetType]
        );
      });
    }
  );

  const hasChecksForClusterTypeScenarios = [
    {
      catalog: [
        { metadata: { target_type: 'host' } },
        { metadata: { target_type: 'cluster' } },
        { metadata: { target_type: 'acme' } },
        { metadata: {} },
        { check_id: '1' },
      ],
      expectations: {
        hana_scale_up: true,
        hana_scale_out: true,
        ascs_ers: true,
      },
    },
    {
      catalog: [
        { metadata: { target_type: 'host' } },
        { metadata: { target_type: 'cluster', cluster_type: 'ascs_ers' } },
        { metadata: { target_type: 'acme' } },
      ],
      expectations: {
        hana_scale_up: false,
        hana_scale_out: false,
        ascs_ers: true,
      },
    },
    {
      catalog: [
        { metadata: { target_type: 'acme' } },
        { metadata: {} },
        { check_id: '1' },
      ],
      expectations: {
        hana_scale_up: true,
        hana_scale_out: true,
        ascs_ers: true,
      },
    },
    {
      catalog: [
        {
          metadata: {
            target_type: 'cluster',
            cluster_type: ['hana_scale_up', 'ascs_ers'],
          },
        },
      ],
      expectations: {
        hana_scale_up: true,
        hana_scale_out: false,
        ascs_ers: true,
      },
    },
    {
      catalog: [
        {
          metadata: {
            target_type: 'cluster',
            cluster_type: 'hana_scale_out',
          },
        },
      ],
      expectations: {
        hana_scale_up: false,
        hana_scale_out: true,
        ascs_ers: false,
      },
    },
  ];
  it.each(hasChecksForClusterTypeScenarios)(
    'should check if catalog has checks for a cluster type',
    ({ catalog, expectations }) => {
      [HANA_SCALE_UP, HANA_SCALE_OUT, ASCS_ERS].forEach((clusterType) => {
        expect(hasChecksForClusterType(catalog, clusterType)).toBe(
          expectations[clusterType]
        );
      });
    }
  );
});
