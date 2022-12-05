export const checksSelectedAction = 'CHECKS_SELECTED';

export const checksSelected = (selectedChecks, clusterID) => ({
  type: checksSelectedAction,
  payload: { checks: selectedChecks, clusterID },
});
