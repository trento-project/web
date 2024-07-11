import { ASCS_ERS } from '@lib/model/clusters';

export const buildEnv = ({
  provider,
  target_type,
  cluster_type,
  ensa_version,
  filesystem_type,
  architecture_type,
}) => {
  switch (cluster_type) {
    case ASCS_ERS: {
      return {
        provider,
        target_type,
        cluster_type,
        ensa_version,
        filesystem_type,
      };
    }
    default: {
      return {
        provider,
        target_type,
        cluster_type,
        architecture_type,
      };
    }
  }
};
