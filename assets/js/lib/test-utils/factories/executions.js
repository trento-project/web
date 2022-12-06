/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { resultEnum } from '.';

export const checksExecutionStatusEnum = () =>
  faker.helpers.arrayElement(['running', 'completed']);

const expectationReturnTypeEnum = () =>
  faker.helpers.arrayElement(['expect', 'expect_same']);

export const executionValueFactory = Factory.define(() => ({
  name: faker.animal.cat(),
  value: faker.datatype.number(),
}));

export const executionExpectationEvaluationFactory = Factory.define(
  ({ sequence, params }) => {
    const name = params.name || `expectation_${sequence}`;

    return {
      name,
      return_value: faker.datatype.number(),
      type: expectationReturnTypeEnum(),
    };
  }
);

export const executionExpectationEvaluationErrorFactory = Factory.define(
  ({ sequence, params }) => {
    const name = params.name || `expectation_${sequence}`;

    return {
      name,
      message: faker.hacker.phrase(),
      type: faker.animal.dog(),
    };
  }
);

export const expectationResultFactory = Factory.define(
  ({ sequence, params }) => {
    const name = params.name || `expectation_${sequence}`;

    return {
      name,
      result: faker.datatype.boolean(),
      type: expectationReturnTypeEnum(),
    };
  }
);

export const executionFactFactory = Factory.define(() => ({
  check_id: faker.datatype.uuid(),
  result: resultEnum(),
  agents_check_results: [],
  expectation_results: expectationResultFactory.buildList(2),
}));

export const agentCheckResultFactory = Factory.define(() => {
  executionExpectationEvaluationFactory.rewindSequence();

  return {
    agent_id: faker.datatype.uuid(),
    expectation_evaluations: executionExpectationEvaluationFactory.buildList(2),
    facts: executionFactFactory.buildList(2),
    values: executionValueFactory.buildList(2),
  };
});

export const agentCheckErrorFactory = Factory.define(() => ({
  agent_id: faker.datatype.uuid(),
  facts: executionFactFactory.buildList(2),
  type: faker.color.human(),
  message: faker.hacker.phrase(),
}));

export const targetFactory = Factory.define(() => ({
  agent_id: faker.datatype.uuid(),
  checks: Array.from({ length: 5 }).map((_) => faker.datatype.uuid()),
}));

export const checkResultFactory = Factory.define(() => ({
  check_id: faker.datatype.uuid(),
  result: resultEnum(),
  agents_check_results: agentCheckResultFactory.buildList(2),
  expectation_results: expectationResultFactory.buildList(2),
}));

export const checksExecutionRunningFactory = Factory.define(() => ({
  completed_at: null,
  execution_id: faker.datatype.uuid(),
  group_id: faker.datatype.uuid(),
  result: null,
  started_at: faker.date.soon(),
  status: 'running',
  timeout: [],
  check_results: null,
  targets: targetFactory.buildList(2),
  passing_count: null,
  warning_count: null,
  critical_count: null,
}));

export const withCompletedResults = (execution, result, checkResults) => ({
  ...execution,
  status: 'completed',
  result: result || checksExecutionStatusEnum(),
  check_results: checkResults || checkResultFactory.buildList(2),
  completed_at: faker.date.soon(),
});

export const checksExecutionCompletedFactory = Factory.define(({ params }) =>
  withCompletedResults(checksExecutionRunningFactory.build(params))
);

export const withEmptyExpectations = (checkResult) => {
  const agents = checkResult.agents_check_results.map((agent) => ({
    ...agent,
    expectation_evaluations: [],
  }));

  return {
    ...checkResult,
    agents_check_results: agents,
    expectation_results: [],
  };
};

const addExpectation = (checkResult, name, expec, result) => {
  const agents = checkResult.agents_check_results.map((agent) => {
    const evals = [...agent.expectation_evaluations, expec];

    return {
      ...agent,
      expectation_evaluations: evals,
    };
  });

  const results = [
    ...checkResult.expectation_results,
    expectationResultFactory.build({ name, result }),
  ];

  return {
    ...checkResult,
    agents_check_results: agents,
    expectation_results: results,
  };
};

export const addPassingExpectation = (checkResult, type) => {
  const name = faker.company.name();
  const expec = executionExpectationEvaluationFactory.build({
    name,
    type,
    return_value: true,
  });

  return addExpectation(checkResult, name, expec, true);
};

export const addCriticalExpectation = (checkResult, type) => {
  const name = faker.company.name();
  const expec = executionExpectationEvaluationFactory.build({
    name,
    type,
    return_value: false,
  });

  return addExpectation(checkResult, name, expec, false);
};

export const addExpectationWithError = (checkResult) => {
  const name = faker.company.name();
  const expec = executionExpectationEvaluationErrorFactory.build({
    name,
  });

  return addExpectation(checkResult, name, expec, false);
};
