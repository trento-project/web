import { map, uniq } from 'lodash';

// Cluster types
export const HANA_SCALE_UP = 'hana_scale_up';
export const HANA_SCALE_OUT = 'hana_scale_out';
export const ASCS_ERS = 'ascs_ers';
export const HANA_ASCS_ERS = 'hana_ascs_ers';

// Hana scale up scenarios
export const COST_OPT_SCENARIO = 'cost_optimized';
export const PERFORMANCE_SCENARIO = 'performance_optimized';

export const clusterTypes = [HANA_SCALE_UP, HANA_SCALE_OUT, ASCS_ERS];

const clusterTypeLabels = {
  [HANA_SCALE_UP]: 'HANA Scale Up',
  [HANA_SCALE_OUT]: 'HANA Scale Out',
  [ASCS_ERS]: 'ASCS/ERS',
  [HANA_ASCS_ERS]: 'HANA+ASCS/ERS',
};
export const isValidClusterType = (clusterType) =>
  clusterTypes.includes(clusterType);

export const getClusterTypeLabel = (type) =>
  clusterTypeLabels[type] || 'Unknown';

export const hanaClusterScenarioTypes = [
  COST_OPT_SCENARIO,
  PERFORMANCE_SCENARIO,
];

const clusterScenarioLabels = {
  [PERFORMANCE_SCENARIO]: 'Perf. Opt.',
  [COST_OPT_SCENARIO]: 'Cost Opt.',
};

export const getClusterScenarioLabel = (type) =>
  clusterScenarioLabels[type] || '';

export const clusterCatalogFilters = [
  { type: HANA_SCALE_UP, hanaScenario: PERFORMANCE_SCENARIO },
  { type: HANA_SCALE_UP, hanaScenario: COST_OPT_SCENARIO },
  { type: HANA_SCALE_OUT, hanaScenario: null },
  { type: ASCS_ERS, hanaScenario: null },
];

export const ANGI_ARCHITECTURE = 'angi';
export const CLASSIC_ARCHITECTURE = 'classic';

export const FS_TYPE_RESOURCE_MANAGED = 'resource_managed';
export const FS_TYPE_SIMPLE_MOUNT = 'simple_mount';
export const FS_TYPE_MIXED = 'mixed_fs_types';

export const getClusterSids = ({ sap_instances: sapInstances }) =>
  uniq(map(sapInstances, 'sid'));
