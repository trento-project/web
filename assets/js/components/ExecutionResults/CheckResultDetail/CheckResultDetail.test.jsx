import React from 'react';
import { render, screen } from '@testing-library/react';

import { faker } from '@faker-js/faker';

import {
  addPassingExpectExpectation,
  addPassingExpectSameExpectation,
  emptyCheckResultFactory,
  hostFactory,
  checksExecutionCompletedFactory,
  checkResultFactory,
  addCriticalExpectExpectation,
  agentCheckErrorFactory,
  executionFactErrorFactory,
  executionFactFactory,
} from '@lib/test-utils/factories';

import '@testing-library/jest-dom';
import CheckResultDetail from './CheckResultDetail';

describe('CheckResultDetail Component', () => {
  it('should render the result detail for a check on a host target', async () => {
    const clusterHosts = hostFactory.buildList(2);
    const [{ id: target1 }, { id: target2 }] = clusterHosts;
    const targetType = 'host';

    const expectationName1 = faker.company.name();
    const expectationName2 = faker.company.name();
    const expectationName3 = faker.company.name();
    const expectationName4 = faker.company.name();
    const expectationName5 = faker.company.name();

    let checkResult = emptyCheckResultFactory.build({
      targets: [target1, target2],
    });
    const {
      check_id: checkID,
      agents_check_results: [{ values, facts }, _],
    } = checkResult;

    checkResult = addPassingExpectExpectation(checkResult, expectationName1);
    checkResult = addPassingExpectExpectation(checkResult, expectationName2);
    checkResult = addCriticalExpectExpectation(checkResult, expectationName3);
    checkResult = addCriticalExpectExpectation(checkResult, expectationName4);
    checkResult = addCriticalExpectExpectation(checkResult, expectationName5);
    checkResult = addPassingExpectSameExpectation(
      checkResult,
      'expectation_name'
    );

    const executionData = checksExecutionCompletedFactory.build({
      check_results: [checkResultFactory.build(), checkResult],
    });

    render(
      <CheckResultDetail
        checkID={checkID}
        targetID={target1}
        targetType={targetType}
        executionData={executionData}
        clusterHosts={clusterHosts}
      />
    );

    expect(screen.getAllByText('Passing')).toHaveLength(2);
    expect(screen.getAllByText('Failing')).toHaveLength(3);
    expect(screen.getByText(expectationName1)).toBeVisible();
    expect(screen.getByText(expectationName2)).toBeVisible();
    expect(screen.getByText(expectationName3)).toBeVisible();
    expect(screen.getByText(expectationName4)).toBeVisible();
    expect(screen.getByText(expectationName5)).toBeVisible();

    values.forEach(({ name, value }) => {
      expect(screen.getByText(name)).toBeVisible();
      expect(screen.getByText(value)).toBeVisible();
    });
    facts.forEach(({ name, _value }) => {
      expect(screen.getByText(name)).toBeVisible();
    });
    expect(screen.getAllByLabelText('property tree')).toHaveLength(
      facts.length
    );
  });

  describe('Host Target error handling', () => {
    it('should render the check detail when a fact gathering error occurs', () => {
      const clusterHosts = hostFactory.buildList(2);
      const [{ id: target1 }] = clusterHosts;
      const targetType = 'host';

      const agentCheckErrorResult = agentCheckErrorFactory.build({
        agent_id: target1,
        type: 'fact_gathering_error',
        facts: [
          executionFactErrorFactory.build(),
          executionFactFactory.build(),
        ],
      });

      const checkResult = checkResultFactory.build({
        agents_check_results: [agentCheckErrorResult],
      });

      const executionData = checksExecutionCompletedFactory.build({
        check_results: [checkResultFactory.build(), checkResult],
      });

      const {
        check_id: checkID,
        agents_check_results: [{ facts }],
      } = checkResult;

      const { message: factGatheringErrorMessage } = agentCheckErrorResult;

      render(
        <CheckResultDetail
          checkID={checkID}
          targetID={target1}
          targetType={targetType}
          executionData={executionData}
          clusterHosts={clusterHosts}
        />
      );

      expect(screen.queryAllByText('Passing')).toHaveLength(0);
      expect(screen.queryAllByText('Failing')).toHaveLength(0);
      expect(screen.getByText(factGatheringErrorMessage)).toBeVisible();

      expect(screen.getByText('Expected Values unavailable')).toBeVisible();

      facts.forEach(({ name, _value }) => {
        expect(screen.getByText(name)).toBeVisible();
      });

      const [{ message: factErrorMessage }, _] = facts;
      expect(screen.getByText(factErrorMessage)).toBeVisible();

      expect(screen.getAllByLabelText('property tree')).toHaveLength(
        facts.length - 1
      );
    });

    it('should render the check detail when an agent times out', () => {
      const clusterHosts = hostFactory.buildList(2);
      const [_, { id: target2 }] = clusterHosts;
      const targetType = 'host';

      const agentTimeoutCheckResult = agentCheckErrorFactory.build({
        agent_id: target2,
        type: 'timeout',
        facts: null,
      });

      const checkResult = checkResultFactory.build({
        agents_check_results: [agentTimeoutCheckResult],
      });

      const executionData = checksExecutionCompletedFactory.build({
        check_results: [checkResultFactory.build(), checkResult],
      });

      const {
        check_id: checkID,
        agents_check_results: [{ facts, values }],
      } = checkResult;

      const { message: timeoutMessage } = agentTimeoutCheckResult;

      render(
        <CheckResultDetail
          checkID={checkID}
          targetID={target2}
          targetType={targetType}
          executionData={executionData}
          clusterHosts={clusterHosts}
        />
      );

      expect(screen.queryAllByText('Passing')).toHaveLength(0);
      expect(screen.queryAllByText('Failing')).toHaveLength(0);
      expect(screen.getByText(timeoutMessage)).toBeVisible();

      expect(values).toBeUndefined();
      expect(screen.getByText('Expected Values unavailable')).toBeVisible();

      expect(facts).toBeNull();
      expect(screen.getByText('No facts were gathered')).toBeVisible();
    });
  });
});
