import {
  EXPECT_SAME,
  TARGET_CLUSTER,
  TARGET_HOST,
  PASSING,
  isHostExpectation,
} from '@lib/model';

export const isTargetHost = (targetType) => targetType === TARGET_HOST;
export const isTargetCluster = (targetType) => targetType === TARGET_CLUSTER;

export const isExpectSame = ({ type }) => type === EXPECT_SAME;

export const isAgentCheckError = ({ type }) => !!type;

export const description = (catalog, checkId) =>
  catalog.find(({ id }) => id === checkId)?.description;

export const sortChecks = (checksResults = []) =>
  checksResults.sort((a, b) => (a.check_id > b.check_id ? 1 : -1));

export const sortHosts = (hosts = []) =>
  hosts.sort((a, b) => (a.host_id > b.host_id ? 1 : -1));

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

export const getCatalogCategoryList = (catalog, checksResults = []) => {
  if (!catalog || catalog.length === 0 || !checksResults) {
    return [];
  }
  return [
    ...new Set(
      checksResults.map(
        ({ check_id }) =>
          catalog.find((check) => check.id === check_id)?.group || ''
      )
    ),
  ].sort();
};

export const getCheckDescription = (catalog, checkID) => {
  const check = findCheck(catalog, checkID);
  if (check) {
    return check.description;
  }
  return null;
};

export const getCheckGroup = (catalog, checkID) => {
  const check = findCheck(catalog, checkID);
  if (check) {
    return check.group;
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

export const getCheckExpectations = (catalog, checkID) => {
  const check = findCheck(catalog, checkID);
  if (check) {
    return check.expectations;
  }
  return [];
};

export const getHostExpectationStatements = (expectationList) =>
  expectationList.filter(isHostExpectation);

export const getExpectSameStatements = (expectationList) =>
  expectationList.filter(isExpectSame);

const expectationByName =
  (expectationName) =>
  ({ name }) =>
    name === expectationName;

export const getHostExpectationStatementsResults = (
  expectations,
  expectationEvaluations
) =>
  getHostExpectationStatements(expectations).map(
    ({ name }) => expectationEvaluations.find(expectationByName(name)) || {}
  );

export const getExpectSameStatementResult = (expectationResults, name) => {
  const expectSameStatement = expectationResults.find(expectationByName(name));

  if (!expectSameStatement) {
    return { name, result: null };
  }

  return expectSameStatement;
};

export const getExpectSameStatementsResults = (
  expectations,
  expectationResults
) =>
  getExpectSameStatements(expectations).map(({ name }) =>
    getExpectSameStatementResult(expectationResults, name)
  );

export const getClusterCheckResults = (executionData, checkID) => {
  const checkResult = getCheckResults(executionData).find(
    ({ check_id }) => check_id === checkID
  );

  if (!checkResult) {
    return {};
  }

  return checkResult;
};

export const getAgentCheckResultByAgentID = (
  executionData,
  checkID,
  agentID
) => {
  const { agents_check_results = [] } = getClusterCheckResults(
    executionData,
    checkID
  );

  return (
    agents_check_results.find(({ agent_id }) => agent_id === agentID) || {}
  );
};

export const getHostExpectationStatementsMet = (expectationEvaluations) =>
  getHostExpectationStatements(expectationEvaluations).filter(
    ({ return_value }) => return_value === true || return_value === PASSING
  ).length;

export const getExpectSameFacts = (expectations, agentsCheckResults) =>
  getExpectSameStatements(expectations).map(({ name }) => ({
    name,
    value: {
      [name]: agentsCheckResults
        .map(({ hostname, expectation_evaluations = [], message }) => ({
          hostname,
          message,
          ...getExpectSameStatementResult(expectation_evaluations, name),
        }))
        .reduce((accumulator, { hostname, message, return_value }) => {
          accumulator[hostname] = return_value || message;
          return accumulator;
        }, {}),
    },
  }));

export const getTargetName = (target, targetType) => {
  switch (targetType) {
    case TARGET_CLUSTER:
      return target.name;
    case TARGET_HOST:
      return target.hostname;
    default:
      return null;
  }
};

export const normalizeExpectationResult = (result, severity) => {
  switch (result) {
    case true:
      return PASSING;
    case false:
      return severity;
    default:
      return result;
  }
};
