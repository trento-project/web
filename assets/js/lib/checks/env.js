import { ASCS_ERS, HANA_SCALE_UP } from '@lib/model/clusters';

export const buildEnv = ({
  provider,
  target_type,
  cluster_type,
  ensa_version,
  filesystem_type,
  architecture_type,
  hana_scenario,
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
    case HANA_SCALE_UP: {
      return {
        provider,
        target_type,
        cluster_type,
        architecture_type,
        hana_scenario,
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
