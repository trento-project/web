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

export const withEmptyExpectations = (checkResult) => {
  const agents = checkResult.agents_check_results.map((agent) => {
    return {
      ...agent,
      expectation_evaluations: [],
    };
  });

  return {
    ...checkResult,
    agents_check_results: agents,
    expectation_results: [],
  };
};

const addExpectation = (checkResult, name, expec, result) => {
  const agents = checkResult.agents_check_results.map((agent) => {
    agent.expectation_evaluations.push(expec)
      
    return agent
  });

  checkResult.expectation_results.push(
    expectationResultFactory.build({ name: name, result: result })
  );

  return {
    ...checkResult,
    agents_check_results: agents,
  };
};

export const addPassingExpectation = (checkResult, type) => {
  const name = faker.company.name();
  const expec = executionExpectationEvaluationFactory.build({
    name: name,
    type: type,
    return_value: true,
  })

  return addExpectation(checkResult, name, expec, true)
}

export const addCriticalExpectation = (checkResult, type) => {
  const name = faker.company.name();
  const expec = executionExpectationEvaluationFactory.build({
    name: name,
    type: type,
    return_value: false,
  })

  return addExpectation(checkResult, name, expec, false)
}

export const addExpectationWithError = (checkResult) => {
  const name = faker.company.name();
  const expec = executionExpectationEvaluationErrorFactory.build({ name: name });

  return addExpectation(checkResult, name, expec, false)
}

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

export const expectationResultFactory = Factory.define(({ sequence, params }) => {
  const name = params.name || `expectation_${sequence}`;
  
  return {
    name: name,
    result: faker.datatype.boolean(),
    type: expectationReturnTypeEnum(),
  }
});

export const executionExpectationEvaluationFactory = Factory.define(({ sequence, params }) => {
  const name = params.name || `expectation_${sequence}`;
  
  return {
    name: name,
    return_value: faker.datatype.number(),
    type: expectationReturnTypeEnum(),
  }
});

export const executionExpectationEvaluationErrorFactory = Factory.define(
  ({ sequence, params }) => {

  const name = params.name || `expectation_${sequence}`;

  return {
    name: name,
    message: faker.hacker.phrase(),
    type: faker.animal.dog(),
  }}
);

export const executionFactFactory = Factory.define(() => ({
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
