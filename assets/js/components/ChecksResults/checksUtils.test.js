import { faker } from '@faker-js/faker';
import {
  agentCheckResultFactory,
  catalogCheckFactory,
  checksExecutionCompletedFactory,
  checksExecutionRunningFactory,
  checkResultFactory,
} from '@lib/test-utils/factories';

import {
  getCheckDescription,
  getCheckResults,
  getChecks,
  getHealth,
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

  describe('getHealth', () => {
    it('getHealth should return health', () => {
      const checkResult = checkResultFactory.build();
      const { check_id: checkID, agents_check_results: agentChecks } =
        checkResult;

      const { health, expectations, failedExpectations } = getHealth(
        [checkResult],
        checkID,
        agentChecks[0].agent_id
      );

      expect(health).toBe('passing');
      expect(expectations).toBe(2);
      expect(failedExpectations).toBe(0);
    });

    it('getHealth should return undefined when check is not found', () => {
      const checkResult = checkResultFactory.build();
      const { agents_check_results: agentChecks } = checkResult;
      const healthInfo = getHealth(
        [checkResult],
        'carbonara',
        agentChecks[0].agent_id
      );

      expect(healthInfo).toBe(undefined);
    });
  });
});
