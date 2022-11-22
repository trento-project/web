import { faker } from '@faker-js/faker';
import { checksExecutionFactory } from '@lib/test-utils/factories';

import { getCheckResults, getChecks, getHealth, getHosts } from './checksUtils';

describe('checksUtils', () => {
  it('getChecksResults returns a list of checks results', () => {
    const agentID = faker.datatype.uuid;
    const checksExecution = checksExecutionFactory.build({ agentID });
    const checksResult = getCheckResults(checksExecution);

    expect(checksResult[0].agents_check_results[0].agent_id).toBe(agentID);
    expect(
      checksResult[0].agents_check_results[0].expectation_evaluations.length
    ).toBe(1);
  });

  it('getChecksResults returns an empty list when there are no checks results', () => {
    expect(getCheckResults({})).toStrictEqual([]);
  });

  it('getHosts returns hostnames', () => {
    const agentID = faker.datatype.uuid;
    const { check_results: checkResults } = checksExecutionFactory.build({
      agentID,
    });

    expect(getHosts(checkResults)).toStrictEqual([agentID]);
  });

  it('getHealth should return health', () => {
    const agentID = faker.datatype.uuid();
    const checkID = faker.datatype.uuid();
    const { check_results: checkResults } = checksExecutionFactory.build({
      agentID,
      checkID,
    });
    const { health, expectations, failedExpectations } = getHealth(
      checkResults,
      checkID,
      agentID
    );

    expect(health).toBe('passing');
    expect(expectations).toBe(1);
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

  it('getChecks should return a list of the checks', () => {
    const checkID = faker.datatype.uuid();
    const { check_results: checkResults } = checksExecutionFactory.build({
      checkID,
    });

    expect(getChecks(checkResults)).toStrictEqual([checkID]);
  });
});
