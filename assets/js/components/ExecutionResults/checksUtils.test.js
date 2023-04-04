import { faker } from '@faker-js/faker';
import {
  addCriticalExpectation,
  addExpectationWithError,
  addPassingExpectation,
  agentCheckErrorFactory,
  agentCheckResultFactory,
  catalogCheckFactory,
  catalogExpectExpectationFactory,
  catalogExpectSameExpectationFactory,
  checksExecutionCompletedFactory,
  checksExecutionRunningFactory,
  checkResultFactory,
  withEmptyExpectations,
  executionExpectationEvaluationFactory,
  expectationResultFactory,
  agentsCheckResultsWithHostname,
  hostFactory,
} from '@lib/test-utils/factories';
import { EXPECT, EXPECT_SAME } from '@lib/model';

import {
  getCheckDescription,
  getCheckRemediation,
  getCheckResults,
  getChecks,
  getCheckHealthByAgent,
  getCheckExpectations,
  isAgentCheckError,
  getExpectStatements,
  getExpectSameStatements,
  getExpectSameStatementResult,
  getAgentCheckResultByAgentID,
  getExpectStatementsMet,
  isPremium,
  getClusterCheckResults,
  getExpectSameStatementsResults,
  getExpectSameFacts,
} from './checksUtils';

describe('checksUtils', () => {
  describe('getChecksResults', () => {
    it('getChecksResults returns a list of checks results', () => {
      const execution = checksExecutionCompletedFactory.build();
      const checkResults = getCheckResults(execution);
      expect(checkResults).toBe(execution.check_results);
    });

    it('getChecksResults returns an empty list when the execution is empty', () => {
      expect(getCheckResults({})).toStrictEqual([]);
    });

    it('getChecksResults returns an empty list when there are no checks results', () => {
      const execution = checksExecutionRunningFactory.build();
      expect(getCheckResults(execution)).toStrictEqual([]);
    });
  });

  it('getChecks should return a list of the checks', () => {
    const checkID1 = faker.datatype.uuid();
    const checkID2 = faker.datatype.uuid();
    const check1 = checkResultFactory.build({
      check_id: checkID1,
    });
    const check2 = checkResultFactory.build({
      check_id: checkID2,
    });

    expect(getChecks([check1, check2])).toStrictEqual([checkID1, checkID2]);
  });

  it('getDescription should return a check description', () => {
    const catalog = catalogCheckFactory.buildList(2);
    const [{ id, description }] = catalog;

    expect(getCheckDescription(catalog, id)).toBe(description);
  });

  it('getCheckRemediation should return a check remediation', () => {
    const catalog = catalogCheckFactory.buildList(2);
    const [{ id, remediation }] = catalog;

    expect(getCheckRemediation(catalog, id)).toBe(remediation);
    expect(getCheckRemediation(catalog, 'wont-be-found')).toBe(null);
  });

  it('getCheckExpectations should return check expectations', () => {
    const catalog = catalogCheckFactory.buildList(2);
    const [_, { id, expectations }] = catalog;

    expect(getCheckExpectations(catalog, id)).toBe(expectations);
    expect(getCheckExpectations(catalog, 'wont-be-found')).toHaveLength(0);
  });

  describe('getCheckHealthByAgent', () => {
    it('should return an empty map when check results are empty', () => {
      expect(
        getCheckHealthByAgent(
          null,
          faker.datatype.uuid(),
          faker.datatype.uuid()
        )
      ).toStrictEqual({});
    });

    it('should return empty map when check is not found', () => {
      const checkResult = checkResultFactory.build();
      const healthInfo = getCheckHealthByAgent(
        [checkResult],
        faker.datatype.uuid(),
        faker.datatype.uuid()
      );

      expect(healthInfo).toStrictEqual({});
    });

    it('should return empty map when agent is not found', () => {
      const agentResult = agentCheckResultFactory.build();
      const checkResult = checkResultFactory.build({
        agents_check_results: [agentResult],
      });

      const { check_id: checkID } = checkResult;

      const healthInfo = getCheckHealthByAgent(
        [checkResult],
        checkID,
        faker.datatype.uuid()
      );

      expect(healthInfo).toStrictEqual({});
    });

    it('should return an agent error result', () => {
      const agentError = agentCheckErrorFactory.build();
      const checkResult = checkResultFactory.build({
        agents_check_results: [agentError],
      });

      const { check_id: checkID } = checkResult;
      const { agent_id: agentID, message } = agentError;

      const { health, error, expectations, failedExpectations } =
        getCheckHealthByAgent([checkResult], checkID, agentID);

      expect(health).toBe('critical');
      expect(error).toBe(message);
      expect(expectations).toBe(undefined);
      expect(failedExpectations).toBe(undefined);
    });

    it('should count expect and expect_same type errors', () => {
      let checkResult = checkResultFactory.build({ result: 'critical' });
      checkResult = withEmptyExpectations(checkResult);
      checkResult = addPassingExpectation(checkResult, 'expect');
      checkResult = addPassingExpectation(checkResult, 'expect_same');
      checkResult = addCriticalExpectation(checkResult, 'expect');
      checkResult = addCriticalExpectation(checkResult, 'expect_same');
      checkResult = addExpectationWithError(checkResult);

      const { check_id: checkID, agents_check_results: agents } = checkResult;
      const { agent_id: agentID } = agents[0];

      const { health, error, expectations, failedExpectations } =
        getCheckHealthByAgent([checkResult], checkID, agentID);

      expect(health).toBe('critical');
      expect(error).toBe(undefined);
      expect(expectations).toBe(5);
      expect(failedExpectations).toBe(3);
    });

    it('should set result as warnning', () => {
      let checkResult = checkResultFactory.build({ result: 'warning' });
      checkResult = withEmptyExpectations(checkResult);
      checkResult = addExpectationWithError(checkResult, 'expect');

      const { check_id: checkID, agents_check_results: agents } = checkResult;
      const { agent_id: agentID } = agents[0];

      const { health } = getCheckHealthByAgent([checkResult], checkID, agentID);

      expect(health).toBe('warning');
    });

    it('should detect a check error', () => {
      const errorCheckResult = agentCheckErrorFactory.build({
        type: 'fact_gathering_error',
      });
      const timeoutCheckResult = agentCheckErrorFactory.build({
        type: 'timeout',
      });
      const successfulCheckResult = agentCheckResultFactory.build();

      expect(isAgentCheckError(errorCheckResult)).toBe(true);
      expect(isAgentCheckError(timeoutCheckResult)).toBe(true);
      expect(isAgentCheckError(successfulCheckResult)).toBe(false);
    });

    it('should get expectation statements from a list', () => {
      const evaluationList = [
        ...executionExpectationEvaluationFactory.buildList(3, {
          type: EXPECT,
        }),
        ...executionExpectationEvaluationFactory.buildList(4, {
          type: EXPECT_SAME,
        }),
      ];
      const resultList = [
        ...expectationResultFactory.buildList(2, {
          type: EXPECT,
        }),
        expectationResultFactory.build({
          type: EXPECT_SAME,
        }),
      ];

      expect(getExpectStatements(evaluationList)).toHaveLength(3);
      expect(getExpectSameStatements(evaluationList)).toHaveLength(4);

      expect(getExpectStatements(resultList)).toHaveLength(2);
      expect(getExpectSameStatements(resultList)).toHaveLength(1);
    });

    it('should get expect_same statement result', () => {
      const expectationName = faker.lorem.word();
      const anotherExpectationName = faker.color.human();
      const expectSameResult = expectationResultFactory.build({
        type: EXPECT_SAME,
        name: expectationName,
      });
      const resultList = [
        ...expectationResultFactory.buildList(2, {
          type: EXPECT,
        }),
        expectSameResult,
      ];

      expect(getExpectSameStatementResult(resultList, expectationName)).toBe(
        expectSameResult
      );
      expect(
        getExpectSameStatementResult(resultList, anotherExpectationName)
      ).toEqual({
        name: anotherExpectationName,
        result: null,
      });
    });

    it('should get expect_same statement results for a set of catalog expectations', () => {
      const expectationName = faker.lorem.word();
      const anotherExpectationName = faker.color.human();

      const expectations = [
        ...catalogExpectExpectationFactory.buildList(2),
        catalogExpectSameExpectationFactory.build({
          name: expectationName,
        }),
        catalogExpectSameExpectationFactory.build({
          name: anotherExpectationName,
        }),
      ];

      const expectSameResult = expectationResultFactory.build({
        type: EXPECT_SAME,
        name: expectationName,
      });
      const expectationResults = [
        ...expectationResultFactory.buildList(2, {
          type: EXPECT,
        }),
        expectSameResult,
      ];

      expect(
        getExpectSameStatementsResults(expectations, expectationResults)
      ).toEqual([
        expectSameResult,
        {
          name: anotherExpectationName,
          result: null,
        },
      ]);
    });

    it('should get facts for expect_same statement', () => {
      const clusterHosts = hostFactory.buildList(2);
      const [
        { id: agent1, hostname: hostname1 },
        { id: agent2, hostname: hostname2 },
      ] = clusterHosts;

      const expectationName = faker.lorem.word();
      const anotherExpectationName = faker.color.human();

      const expectations = [
        ...catalogExpectExpectationFactory.buildList(2),
        catalogExpectSameExpectationFactory.build({
          name: expectationName,
        }),
        catalogExpectSameExpectationFactory.build({
          name: anotherExpectationName,
        }),
      ];

      const factValueFromAgent1ForExpectation1 = faker.lorem.word();
      const factValueFromAgent1ForExpectation2 = faker.lorem.sentence();
      const factValueFromAgent2ForExpectation1 = faker.lorem.slug();
      const factValueFromAgent2ForExpectation2 = faker.lorem.paragraph();

      const agent1CheckResult = agentCheckResultFactory.build({
        agent_id: agent1,
        expectation_evaluations: [
          executionExpectationEvaluationFactory.build({
            name: expectationName,
            type: EXPECT_SAME,
            return_value: factValueFromAgent1ForExpectation1,
          }),
          executionExpectationEvaluationFactory.build({
            name: anotherExpectationName,
            type: EXPECT_SAME,
            return_value: factValueFromAgent1ForExpectation2,
          }),
        ],
      });

      const agent2CheckResult = agentCheckResultFactory.build({
        agent_id: agent2,
        expectation_evaluations: [
          executionExpectationEvaluationFactory.build({
            name: expectationName,
            type: EXPECT_SAME,
            return_value: factValueFromAgent2ForExpectation1,
          }),
          executionExpectationEvaluationFactory.build({
            name: anotherExpectationName,
            type: EXPECT_SAME,
            return_value: factValueFromAgent2ForExpectation2,
          }),
        ],
      });

      const agentsCheckResults = agentsCheckResultsWithHostname(
        [agent1CheckResult, agent2CheckResult],
        clusterHosts
      );

      expect(getExpectSameFacts(expectations, agentsCheckResults)).toEqual([
        {
          name: expectationName,
          value: {
            [expectationName]: {
              [hostname1]: factValueFromAgent1ForExpectation1,
              [hostname2]: factValueFromAgent2ForExpectation1,
            },
          },
        },
        {
          name: anotherExpectationName,
          value: {
            [anotherExpectationName]: {
              [hostname1]: factValueFromAgent1ForExpectation2,
              [hostname2]: factValueFromAgent2ForExpectation2,
            },
          },
        },
      ]);
    });

    it('should get facts for expect_same statement in case of an error or timeout', () => {
      const clusterHosts = hostFactory.buildList(3);
      const [
        { id: agent1, hostname: hostname1 },
        { id: agent2, hostname: hostname2 },
        { id: agent3, hostname: hostname3 },
      ] = clusterHosts;

      const expectationName = faker.lorem.word();
      const anotherExpectationName = faker.color.human();

      const expectations = [
        ...catalogExpectExpectationFactory.buildList(2),
        catalogExpectSameExpectationFactory.build({
          name: expectationName,
        }),
        catalogExpectSameExpectationFactory.build({
          name: anotherExpectationName,
        }),
      ];

      const errorFromAgent1 = faker.lorem.sentence();
      const errorFromAgent2 = faker.lorem.paragraph();

      const errorCheckResult = agentCheckErrorFactory.build({
        agent_id: agent1,
        type: 'fact_gathering_error',
        message: errorFromAgent1,
      });
      const timeoutCheckResult = agentCheckErrorFactory.build({
        agent_id: agent2,
        type: 'timeout',
        message: errorFromAgent2,
      });

      const factValueFromAgent3ForExpectation1 = faker.lorem.word();
      const factValueFromAgent3ForExpectation2 = faker.lorem.sentence();

      const agent3CheckResult = agentCheckResultFactory.build({
        agent_id: agent3,
        expectation_evaluations: [
          executionExpectationEvaluationFactory.build({
            name: expectationName,
            type: EXPECT_SAME,
            return_value: factValueFromAgent3ForExpectation1,
          }),
          executionExpectationEvaluationFactory.build({
            name: anotherExpectationName,
            type: EXPECT_SAME,
            return_value: factValueFromAgent3ForExpectation2,
          }),
        ],
      });

      const agentsCheckResults = agentsCheckResultsWithHostname(
        [errorCheckResult, timeoutCheckResult, agent3CheckResult],
        clusterHosts
      );

      expect(getExpectSameFacts(expectations, agentsCheckResults)).toEqual([
        {
          name: expectationName,
          value: {
            [expectationName]: {
              [hostname1]: errorFromAgent1,
              [hostname2]: errorFromAgent2,
              [hostname3]: factValueFromAgent3ForExpectation1,
            },
          },
        },
        {
          name: anotherExpectationName,
          value: {
            [anotherExpectationName]: {
              [hostname1]: errorFromAgent1,
              [hostname2]: errorFromAgent2,
              [hostname3]: factValueFromAgent3ForExpectation2,
            },
          },
        },
      ]);
    });

    it('should get checks results for cluster', () => {
      const executionResult = checksExecutionCompletedFactory.build();

      const {
        check_results: [_, checkResult],
      } = executionResult;

      const { check_id: checkID } = checkResult;

      expect(getClusterCheckResults(executionResult, checkID)).toBe(
        checkResult
      );
      expect(getClusterCheckResults(executionResult, 'not-there')).toEqual({});
    });

    it('should get a check result for an agent', () => {
      const executionResult = checksExecutionCompletedFactory.build();

      const {
        check_results: [checkResult],
      } = executionResult;

      const {
        check_id: checkID,
        agents_check_results: [_, agentCheckResult],
      } = checkResult;

      const { agent_id: agentID } = agentCheckResult;

      expect(
        getAgentCheckResultByAgentID(executionResult, checkID, agentID)
      ).toBe(agentCheckResult);
      expect(
        getAgentCheckResultByAgentID(executionResult, 'not-there', agentID)
      ).toEqual({});
      expect(
        getAgentCheckResultByAgentID(executionResult, checkID, 'not-there')
      ).toEqual({});
    });

    it('should count the expect statements met', () => {
      const expectationEvaluations = [
        executionExpectationEvaluationFactory.build({
          type: EXPECT_SAME,
        }),
        ...executionExpectationEvaluationFactory.buildList(2, {
          return_value: false,
          type: EXPECT,
        }),
        ...executionExpectationEvaluationFactory.buildList(3, {
          return_value: true,
          type: EXPECT,
        }),
      ];

      expect(getExpectStatementsMet(expectationEvaluations)).toBe(3);
    });
    it('should return true or false if a check is premium or not', () => {
      const checkIDs = [
        faker.datatype.uuid(),
        faker.datatype.uuid(),
        faker.datatype.uuid(),
        faker.datatype.uuid(),
      ];
      const expectedPremiumValues = [
        true,
        false,
        undefined,
        faker.animal.cat(),
      ];
      const checkCatalog = checkIDs.map((id, index) =>
        catalogCheckFactory.build({ id, premium: expectedPremiumValues[index] })
      );

      checkIDs.forEach((checkID, index) => {
        expect(isPremium(checkCatalog, checkID)).toBe(
          expectedPremiumValues[index]
        );
      });
    });
  });
});
