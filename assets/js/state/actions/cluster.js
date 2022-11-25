export const checksSelectedAction = 'CHECKS_SELECTED';

export const dispatchChecksSelected =
  (selectedChecks, clusterID) => (dispatch) => {
    dispatch({
      type: checksSelectedAction,
      payload: { checks: selectedChecks, clusterID: clusterID },
    });
  };
