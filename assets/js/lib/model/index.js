export const DATABASE_TYPE = 'database';
export const APPLICATION_TYPE = 'application';

export const EXPECT = 'expect';
export const EXPECT_SAME = 'expect_same';

export const TARGET_HOST = 'host';
export const TARGET_CLUSTER = 'cluster';

export const isValidTargetType = (targetType) =>
  [TARGET_HOST, TARGET_CLUSTER].includes(targetType);

export const AWS_PROVIDER = 'aws';
export const AZURE_PROVIDER = 'azure';
export const GCP_PROVIDER = 'gcp';
export const NUTANIX_PROVIDER = 'nutanix';
export const KVM_PROVIDER = 'kvm';
export const VMWARE_PROVIDER = 'vmware';
export const UNKNOWN_PROVIDER = 'unknown';

export const providers = [
  AWS_PROVIDER,
  AZURE_PROVIDER,
  GCP_PROVIDER,
  NUTANIX_PROVIDER,
  KVM_PROVIDER,
  VMWARE_PROVIDER,
];
export const isValidProvider = (provider) => providers.includes(provider);

export const CLUSTER_TYPES = ['hana_scale_up', 'hana_scale_out', 'ascs_ers'];
