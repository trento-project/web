import { pipe, some, castArray, filter } from 'lodash/fp';
import { TARGET_CLUSTER } from '.';

const hasMetadata = ({ metadata }) => !!metadata;
const hasClusterTypeMetadata = ({ metadata }) =>
  hasMetadata({ metadata }) && !!metadata.cluster_type;

const isCheckForTarget =
  (targetType) =>
  ({ metadata }) =>
    !hasMetadata({ metadata }) || metadata.target_type === targetType;

export const hasChecksForTarget = (catalog, targetType) =>
  some(isCheckForTarget(targetType))(catalog);

export const hasChecksForClusterType = (catalog, clusterType) =>
  pipe(
    filter(isCheckForTarget(TARGET_CLUSTER)),
    some(
      ({ metadata }) =>
        !hasClusterTypeMetadata({ metadata }) ||
        pipe(
          castArray,
          some((metadataClusterType) => metadataClusterType === clusterType)
        )(metadata.cluster_type)
    )
  )(catalog);
