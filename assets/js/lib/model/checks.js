import { castArray } from 'lodash';
import { TARGET_CLUSTER } from '.';

const isCheckForTarget =
  (targetType) =>
  ({ metadata }) =>
    !metadata || metadata.target_type === targetType;

const supportsClusterType =
  (clusterType) =>
  ({ metadata }) =>
    !metadata?.cluster_type ||
    castArray(metadata.cluster_type).some(
      (metadataClusterType) => metadataClusterType === clusterType
    );

const supportsHanaScenario =
  (hanaScenario) =>
  ({ metadata }) =>
    !metadata?.hana_scenario ||
    castArray(metadata.hana_scenario).some(
      (metadataHanaScenario) => metadataHanaScenario === hanaScenario
    );

export const hasChecksForTarget = (catalog, targetType) =>
  catalog.some(isCheckForTarget(targetType));

export const hasChecksForClusterType = (catalog, clusterType) =>
  catalog
    .filter(isCheckForTarget(TARGET_CLUSTER))
    .some(supportsClusterType(clusterType));

export const hasChecksForHanaScenario = (catalog, hanaScenario) =>
  catalog
    .filter(isCheckForTarget(TARGET_CLUSTER))
    .some(supportsHanaScenario(hanaScenario));
