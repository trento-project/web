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
