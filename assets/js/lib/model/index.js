export const DATABASE_TYPE = 'database';
export const APPLICATION_TYPE = 'application';

export const EXPECT = 'expect';
export const EXPECT_SAME = 'expect_same';

export const TARGET_HOST = 'host';
export const TARGET_CLUSTER = 'cluster';

export const isValidTargetType = (targetType) =>
  [TARGET_HOST, TARGET_CLUSTER].includes(targetType);

export const UNKNOWN_PROVIDER = 'unknown';
export const VMWARE_PROVIDER = 'vmware';

export const CLUSTER_TYPES = ['hana_scale_up', 'hana_scale_out', 'ascs_ers'];
