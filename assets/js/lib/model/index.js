export const EXPECT = 'expect';
export const EXPECT_ENUM = 'expect_enum';
export const EXPECT_SAME = 'expect_same';

const hostExepectations = [EXPECT, EXPECT_ENUM];
export const isHostExpectation = ({ type }) => hostExepectations.includes(type);

export const TARGET_HOST = 'host';
export const TARGET_CLUSTER = 'cluster';

export const targetTypes = [TARGET_HOST, TARGET_CLUSTER];
export const isValidTargetType = (targetType) =>
  targetTypes.includes(targetType);

export const PASSING = 'passing';
export const WARNING = 'warning';
export const CRITICAL = 'critical';

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

export const ARCH_PPC64LE = 'ppc64le';
export const ARCH_S390X = 's390x';
export const ARCH_X86_64 = 'x86_64';
export const ARCH_UNKNOWN = 'unknown';

export const architectures = [ARCH_X86_64, ARCH_PPC64LE, ARCH_S390X];
