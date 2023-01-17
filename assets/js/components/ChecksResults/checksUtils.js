import { uniq } from '@lib/lists';

export const description = (catalog, checkId) =>
  catalog.find(({ id }) => id === checkId)?.description;

export const sortChecks = (checksResults = []) =>
  checksResults.sort((a, b) => (a.check_id > b.check_id ? 1 : -1));

export const sortHosts = (hosts = []) =>
  hosts.sort((a, b) => (a.host_id > b.host_id ? 1 : -1));

export const getHostname =
  (hosts = []) =>
  (hostId) =>
    hosts.reduce((acc, host) => {
      if (host.id === hostId) {
        return host.hostname;
      }

      return acc;
    }, '');

export const findCheck = (catalog, checkID) =>
  catalog?.find((check) => check.id === checkID);

export const getCheckResults = (executionData) => {
  if (!executionData) {
    return [];
  }
  if (!executionData.check_results) {
    return [];
  }
  return executionData.check_results;
};

export const getHosts = (checkResults) =>
  uniq(
    checkResults.flatMap(({ agents_check_results }) =>
      agents_check_results.map(({ agent_id }) => agent_id)
    )
  );

export const getChecks = (checkResults) =>
  checkResults.map(({ check_id }) => check_id);

export const getCheckHealthByAgent = (checkResults, checkID, agentID) => {
  if (!checkResults) {
    return {};
  }

  const checkResult = checkResults.find(({ check_id }) => check_id === checkID);
  if (!checkResult) {
    return {};
  }

  const agentCheckResult = checkResult.agents_check_results.find(
    ({ agent_id }) => agent_id === agentID
  );

  if (!agentCheckResult) {
    return {};
  }

  // agentCheckError
  if (agentCheckResult?.type) {
    return {
      health: 'critical',
      error: agentCheckResult.message,
    };
  }

  // expectation evaluation error, malformed expression most probably
  const evaluationErrors = agentCheckResult?.expectation_evaluations.filter(
    ({ message }) => message
  ).length;

  // expect evaluating to false
  const failedExpectEvaluations =
    agentCheckResult?.expectation_evaluations.filter(
      ({ type, return_value: returnValue }) => type === 'expect' && !returnValue
    ).length;

  // expect_same
  const failedExpectSameEvaluations =
    agentCheckResult?.expectation_evaluations.filter(
      ({ name, type }) =>
        type === 'expect_same' &&
        !checkResult.expectation_results.find(
          ({ name: resultName }) => resultName === name
        )?.result
    ).length;

  const failedExpectations =
    evaluationErrors + failedExpectEvaluations + failedExpectSameEvaluations;

  const health = failedExpectations > 0 ? checkResult.result : 'passing';

  return {
    health,
    expectations: checkResult.expectation_results.length,
    failedExpectations,
  };
};

export const getCheckDescription = (catalog, checkID) => {
  const check = findCheck(catalog, checkID);
  if (check) {
    return check.description;
  }
  return null;
};

export const getCheckRemediation = (catalog, checkID) => {
  const check = findCheck(catalog, checkID);
  if (check) {
    return check.remediation;
  }
  return null;
};
