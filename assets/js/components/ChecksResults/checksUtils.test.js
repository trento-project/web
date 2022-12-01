import { faker } from '@faker-js/faker';
import {
  agentCheckResultFactory,
  catalogCheckFactory,
  checksExecutionFactory,
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
      const checksExecution = checksExecutionFactory.build();
      const checkResults = getCheckResults(checksExecution);

      expect(checkResults).toBe(checksExecution.check_results);
    });

    it('getChecksResults returns an empty list when the execution is empty', () => {
      expect(getCheckResults({})).toStrictEqual([]);
    });

    it('getChecksResults returns an empty list when there are no checks results', () => {
      const checksExecution = checksExecutionFactory.build({
        check_results: [],
      });
      expect(getCheckResults(checksExecution)).toStrictEqual([]);
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
      const checkResults = checkResultFactory.build();
      const { check_id: checkID, agents_check_results: agentChecks } =
        checkResults;

      const { health, expectations, failedExpectations } = getHealth(
        [checkResults],
        checkID,
        agentChecks[0].agent_id
      );

      expect(health).toBe('passing');
      expect(expectations).toBe(2);
      expect(failedExpectations).toBe(0);
    });

    it('getHealth should return undefined when check is not found', () => {
      const agentID = faker.datatype.uuid();
      const { check_results: checkResults } = checksExecutionFactory.build({
        agentID,
      });
      const healthInfo = getHealth(checkResults, 'carbonara', agentID);

      expect(healthInfo).toBe(undefined);
    });
  });
});
