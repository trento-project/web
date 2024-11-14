// Cluster types
export const HANA_SCALE_UP = 'hana_scale_up';
export const HANA_SCALE_OUT = 'hana_scale_out';
export const ASCS_ERS = 'ascs_ers';

// Hana scale up scenarios
export const HANA_SCALE_UP_PERFORMANCE_SCENARIO = 'performance_optimized';
export const HANA_SCALE_UP_COST_OPT_SCENARIO = 'cost_optimized';
export const HANA_SCALE_UP_UNKNOWN_SCENARIO = 'unknown';

export const clusterTypes = [
  HANA_SCALE_UP,
  HANA_SCALE_UP_PERFORMANCE_SCENARIO,
  HANA_SCALE_OUT,
  ASCS_ERS,
];
export const hanaClusterScenarioTypes = [
  HANA_SCALE_UP_PERFORMANCE_SCENARIO,
  HANA_SCALE_UP_UNKNOWN_SCENARIO,
  HANA_SCALE_UP_COST_OPT_SCENARIO,
];

export const isValidClusterType = (clusterType) =>
  clusterTypes.includes(clusterType);

const clusterTypeLabels = {
  [HANA_SCALE_UP]: 'HANA Scale Up',
  [HANA_SCALE_OUT]: 'HANA Scale Out',
  [ASCS_ERS]: 'ASCS/ERS',
};

export const getClusterTypeLabel = (type) =>
  clusterTypeLabels[type] || 'Unknown';

const clusterTypeScenarioLabels = {
  [HANA_SCALE_UP_PERFORMANCE_SCENARIO]: 'performance optimized',
  [HANA_SCALE_UP_COST_OPT_SCENARIO]: 'cost optimized',
};

export const getClusterTypeScenarioLabel = (type) =>
  clusterTypeScenarioLabels[type] || '';

export const ANGI_ARCHITECTURE = 'angi';
export const CLASSIC_ARCHITECTURE = 'classic';

export const FS_TYPE_RESOURCE_MANAGED = 'resource_managed';
export const FS_TYPE_SIMPLE_MOUNT = 'simple_mount';
export const FS_TYPE_MIXED = 'mixed_fs_types';
