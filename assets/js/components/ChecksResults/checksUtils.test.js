import { faker } from '@faker-js/faker';
import {
  agentCheckErrorFactory,
  agentCheckResultFactory,
  catalogCheckFactory,
  checksExecutionCompletedFactory,
  checksExecutionRunningFactory,
  checkResultFactory,
  executionExpectationEvaluationFactory,
  executionExpectationEvaluationErrorFactory,
  expectationResultFactory,
} from '@lib/test-utils/factories';

import {
  getCheckDescription,
  getCheckResults,
  getChecks,
  getCheckHealthByAgent,
  getHosts,
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

  it('getHosts returns hostnames', () => {
    const agent1 = agentCheckResultFactory.build();
    const agent2 = agentCheckResultFactory.build();
    const checkResults = checkResultFactory.buildList(1, {
      agents_check_results: [agent1, agent2],
    });

    expect(getHosts(checkResults)).toStrictEqual([
      agent1.agent_id,
      agent2.agent_id,
    ]);
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
      const { agent_id: agentID, message: message } = agentError;

      const { health, error, expectations, failedExpectations } =
        getCheckHealthByAgent([checkResult], checkID, agentID);

      expect(health).toBe('critical');
      expect(error).toBe(message);
      expect(expectations).toBe(undefined);
      expect(failedExpectations).toBe(undefined);
    });

    it('should count expect and expect_same type errors', () => {
      const expecs = [
        executionExpectationEvaluationFactory.build({
          type: 'expect',
          return_value: true,
        }),
        executionExpectationEvaluationFactory.build({ type: 'expect_same' }),
        executionExpectationEvaluationFactory.build({
          type: 'expect',
          return_value: false,
        }),
        executionExpectationEvaluationFactory.build({ type: 'expect_same' }),
        executionExpectationEvaluationErrorFactory.build(),
      ];

      const evalutionResults = [
        expectationResultFactory.build({ name: expecs[0].name, result: true }),
        expectationResultFactory.build({ name: expecs[1].name, result: true }),
        expectationResultFactory.build({ name: expecs[2].name, result: false }),
        expectationResultFactory.build({ name: expecs[3].name, result: false }),
        expectationResultFactory.build({ name: expecs[4].name, result: false }),
      ];

      const agentResult = agentCheckResultFactory.build({
        expectation_evaluations: expecs,
      });
      const checkResult = checkResultFactory.build({
        agents_check_results: [agentResult],
        expectation_results: evalutionResults,
        result: 'critical',
      });

      const { check_id: checkID } = checkResult;
      const { agent_id: agentID } = agentResult;

      const { health, error, expectations, failedExpectations } =
        getCheckHealthByAgent([checkResult], checkID, agentID);

      expect(health).toBe('critical');
      expect(error).toBe(undefined);
      expect(expectations).toBe(5);
      expect(failedExpectations).toBe(3);
    });

    it('should set result as warnning', () => {
      const expecs = [executionExpectationEvaluationErrorFactory.build()];

      const evalutionResults = [
        expectationResultFactory.build({ name: expecs[0].name, result: false }),
      ];

      const agentResult = agentCheckResultFactory.build({
        expectation_evaluations: expecs,
      });

      const checkResult = checkResultFactory.build({
        agents_check_results: [agentResult],
        expectation_results: evalutionResults,
        result: 'warning',
      });

      const { check_id: checkID } = checkResult;
      const { agent_id: agentID } = agentResult;

      const { health } = getCheckHealthByAgent([checkResult], checkID, agentID);

      expect(health).toBe('warning');
    });
  });
});
