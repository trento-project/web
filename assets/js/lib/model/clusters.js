// Cluster types
export const HANA_SCALE_UP = 'hana_scale_up';
export const HANA_SCALE_OUT = 'hana_scale_out';
export const ASCS_ERS = 'ascs_ers';

// Hana scale up scenarios
export const COST_OPT_SCENARIO = 'cost_optimized';
export const PERFORMANCE_SCENARIO = 'performance_optimized';

// Hana scale up  with scenario
export const HANA_SCALE_UP_PERF_OPT = `${HANA_SCALE_UP}-${PERFORMANCE_SCENARIO}`;
export const HANA_SCALE_UP_COST_OPT = `${HANA_SCALE_UP}-${COST_OPT_SCENARIO}`;

export const clusterTypes = [HANA_SCALE_UP, HANA_SCALE_OUT, ASCS_ERS];

const clusterTypeLabels = {
  [HANA_SCALE_UP]: 'HANA Scale Up',
  [HANA_SCALE_OUT]: 'HANA Scale Out',
  [ASCS_ERS]: 'ASCS/ERS',
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

export const clusterTypesCatalog = [
  HANA_SCALE_UP_PERF_OPT,
  HANA_SCALE_UP_COST_OPT,
  HANA_SCALE_OUT,
  ASCS_ERS,
];

export const clusterTypeLabelsChecksCatalog = {
  [HANA_SCALE_UP_PERF_OPT]: 'HANA Scale Up Perf. Opt.',
  [HANA_SCALE_UP_COST_OPT]: 'HANA Scale Up Cost Opt.',
  [HANA_SCALE_OUT]: 'HANA Scale Out',
  [ASCS_ERS]: 'ASCS/ERS',
};

export const getClusterTypeLabelChecksCatalog = (type) =>
  clusterTypeLabelsChecksCatalog[type] || 'Unknown';

export const ANGI_ARCHITECTURE = 'angi';
export const CLASSIC_ARCHITECTURE = 'classic';

export const FS_TYPE_RESOURCE_MANAGED = 'resource_managed';
export const FS_TYPE_SIMPLE_MOUNT = 'simple_mount';
export const FS_TYPE_MIXED = 'mixed_fs_types';
