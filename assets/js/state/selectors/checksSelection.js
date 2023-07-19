import { TARGET_HOST, TARGET_CLUSTER } from '@lib/model';
import { SAVING, SAVING_FAILED, SUCCESSFULLY_SAVED } from '../checksSelection';

const getHostCheckSelection =
  (hostID) =>
  ({ checksSelection }) =>
    checksSelection?.[TARGET_HOST][hostID] || {};

const getClusterCheckSelection =
  (clusterID) =>
  ({ checksSelection }) =>
    checksSelection?.[TARGET_CLUSTER][clusterID] || {};

const targetToSelector = {
  [TARGET_HOST]: getHostCheckSelection,
  [TARGET_CLUSTER]: getClusterCheckSelection,
};

const getTargetSelector = (targetType) =>
  targetToSelector[targetType] || (() => {});

const getTargetStatus = (state, targetType, targetID) => {
  const targetSelector = getTargetSelector(targetType);
  const { status } = targetSelector(targetID)(state);
  return status;
};

export const isSaving = (targetType, targetID) => (state) =>
  getTargetStatus(state, targetType, targetID) === SAVING;

export const isSuccessfullySaved = (targetType, targetID) => (state) =>
  getTargetStatus(state, targetType, targetID) === SUCCESSFULLY_SAVED;

export const isSavingFailed = (targetType, targetID) => (state) =>
  getTargetStatus(state, targetType, targetID) === SAVING_FAILED;
