import { faker } from '@faker-js/faker';
import {
  agentCheckErrorFactory,
  agentCheckResultFactory,
  catalogCheckFactory,
  catalogExpectExpectationFactory,
  catalogExpectSameExpectationFactory,
  checksExecutionCompletedFactory,
  checksExecutionRunningFactory,
  executionExpectationEvaluationFactory,
  expectationResultFactory,
  agentsCheckResultsWithHostname,
  hostFactory,
  clusterFactory,
  executionExpectationEvaluationErrorFactory,
  failingExpectEvaluationFactory,
} from '@lib/test-utils/factories';
import { EXPECT, EXPECT_SAME } from '@lib/model';

import {
  getCatalogCategoryList,
  getCheckDescription,
  getCheckGroup,
  getCheckRemediation,
  getCheckResults,
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
  getExpectStatementsResults,
  getTargetName,
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

  it('getCatalogCategoryList should return a sorted category list where it is matching', () => {
    const IDs = [faker.number.int(), faker.number.int(), faker.number.int()];
    const checksResults = [
      { check_id: IDs[0] },
      { check_id: IDs[1] },
      { check_id: IDs[2] },
    ];
    const catalog = [
      { id: IDs[0], group: 'Category C' },
      { id: IDs[1], group: 'Category A' },
      { id: IDs[2], group: 'Category B' },
    ];
    const expected = ['Category A', 'Category B', 'Category C'];
    expect(getCatalogCategoryList(catalog, checksResults)).toEqual(expected);
  });

  it('getCatalogCategoryList should return an empty array if checksResults is not provided', () => {
    const IDs = [faker.number.int(), faker.number.int()];
    const catalog = [
      { id: IDs[0], group: faker.lorem.word() },
      { id: IDs[1], group: faker.lorem.word() },
    ];
    const expected = [];
    [[], undefined, null].forEach((item) => {
      expect(getCatalogCategoryList(catalog, item)).toEqual(expected);
    });
  });

  it('getDescription should return a check description', () => {
    const catalog = catalogCheckFactory.buildList(2);
    const [{ id, description }] = catalog;

    expect(getCheckDescription(catalog, id)).toBe(description);
  });

  it('getCheckGroup should return a check grupp', () => {
    const catalog = catalogCheckFactory.buildList(2);
    const check = catalog[0];

    expect(getCheckGroup(catalog, check.id)).toBe(check.group);
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

  it('should get expect statements results', () => {
    const expectations = [
      ...catalogExpectExpectationFactory.buildList(3),
      catalogExpectSameExpectationFactory.build(),
    ];

    const [
      { name: expectation1 },
      { name: expectation2 },
      { name: expectation3 },
      { name: expectation4 },
    ] = expectations;

    const evaluationsList = [
      executionExpectationEvaluationFactory.build({
        name: expectation1,
        type: EXPECT,
      }),
      executionExpectationEvaluationErrorFactory.build({
        name: expectation2,
      }),
      failingExpectEvaluationFactory.build({
        name: expectation3,
      }),
      executionExpectationEvaluationFactory.build({
        name: expectation4,
        type: EXPECT_SAME,
      }),
    ];

    const [
      { return_value: returnValue1 },
      { message, type },
      { failure_message, return_value: returnValue3 },
    ] = evaluationsList;

    expect(getExpectStatementsResults(expectations, evaluationsList)).toEqual([
      {
        name: expectation1,
        return_value: returnValue1,
        type: 'expect',
      },
      {
        name: expectation2,
        message,
        type,
      },
      {
        name: expectation3,
        type: 'expect',
        failure_message,
        return_value: returnValue3,
      },
    ]);
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

    expect(getClusterCheckResults(executionResult, checkID)).toBe(checkResult);
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
      faker.string.uuid(),
      faker.string.uuid(),
      faker.string.uuid(),
      faker.string.uuid(),
    ];
    const expectedPremiumValues = [true, false, undefined, faker.animal.cat()];
    const checkCatalog = checkIDs.map((id, index) =>
      catalogCheckFactory.build({ id, premium: expectedPremiumValues[index] })
    );

    checkIDs.forEach((checkID, index) => {
      expect(isPremium(checkCatalog, checkID)).toBe(
        expectedPremiumValues[index]
      );
    });
  });

  describe('target name detection', () => {
    it('should detect a cluster target name', () => {
      const targetName = faker.lorem.word();
      const target = clusterFactory.build({ name: targetName });

      expect(getTargetName(target, 'cluster')).toBe(targetName);
    });

    it('should detect a host target name', () => {
      const targetName = faker.lorem.word();
      const target = hostFactory.build({ hostname: targetName });

      expect(getTargetName(target, 'host')).toBe(targetName);
    });

    it('should not detect target name for unknown targets', () => {
      const targetName = faker.lorem.word();
      const target = hostFactory.build({ hostname: targetName });

      expect(getTargetName(target, 'unknown-target')).toBeNull();
    });
  });
});
