export const checksSelectedAction = 'CHECKS_SELECTED';

export const checksSelected = (selectedChecks, clusterID) => {
  return {
    type: checksSelectedAction,
    payload: { checks: selectedChecks, clusterID: clusterID },
  };
};
