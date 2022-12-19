export const CHECKS_SELECTED = 'CHECKS_SELECTED';

export const checksSelected = (selectedChecks, clusterID) => ({
  type: CHECKS_SELECTED,
  payload: { checks: selectedChecks, clusterID },
});
