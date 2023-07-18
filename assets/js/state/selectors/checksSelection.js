import { TARGET_HOST, TARGET_CLUSTER } from '@lib/model';

export const getHostCheckSelection =
  (hostID) =>
  ({ checksSelection }) =>
    checksSelection?.[TARGET_HOST][hostID] || {};

export const getClusterCheckSelection =
  (clusterID) =>
  ({ checksSelection }) =>
    checksSelection?.[TARGET_CLUSTER][clusterID] || {};
