export const description = (catalog, checkId) => catalog.find(
  ({ id }) => id === checkId,
)?.description;

export const sortChecks = (checksResults = []) => checksResults.sort(
  (a, b) => (a.check_id > b.check_id ? 1 : -1),
);

export const sortHosts = (hosts = []) => hosts.sort((a, b) => (a.host_id > b.host_id ? 1 : -1));

export const getHostname = (hosts = []) => (hostId) => hosts.reduce((acc, host) => {
  if (host.id === hostId) {
    return host.hostname;
  }

  return acc;
}, '');

export const findCheck = (catalog, checkID) => catalog?.find((check) => check.id === checkID);

export const getCheckResults = (executionData) => {
  if (!executionData) {
    return [];
  }
  if (!executionData.check_results) {
    return [];
  }
  return executionData.check_results;
};

export const getHosts = (checkResults) => checkResults.flatMap(
  ({ agents_check_results }) => agents_check_results.map(({ agent_id }) => agent_id),
);

export const getChecks = (checkResults) => checkResults.map(({ check_id }) => check_id);

export const getHealth = (checkResults, checkID, agentID) => {
  const checkResult = checkResults.find(({ check_id }) => check_id === checkID);
  if (!checkResult) {
    return {};
  }

  const agentCheckResult = checkResult.agents_check_results.find(
    ({ agent_id }) => agent_id === agentID,
  );

  const failedExpectationEvaluations = agentCheckResult?.expectation_evaluations
    .filter((expectationEvaluation) => 'message' in expectationEvaluation)
    .filter(({ type }) => type !== 'expect');

  return {
    expectations: checkResult.expectation_results.length,
    failedExpectations: failedExpectationEvaluations.length,
    health: failedExpectationEvaluations.length > 0 ? 'critical' : 'passing',
  };
};

export const getCheckDescription = (catalog, checkID) => {
  const check = findCheck(catalog, checkID);
  if (check) {
    return check.description;
  }
  return null;
};
