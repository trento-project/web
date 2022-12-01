import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { resultEnum } from '.';

export const checksExecutionStatusEnum = () =>
  faker.helpers.arrayElement(['running', 'completed']);

const expectationReturnTypeEnum = () =>
  faker.helpers.arrayElement(['expect', 'expect_same']);

export const checksExecutionFactory = Factory.define(() => {
  return {
    completed_at: faker.date.soon(),
    execution_id: faker.datatype.uuid(),
    group_id: faker.datatype.uuid(),
    result: resultEnum(),
    started_at: faker.date.soon(),
    status: checksExecutionStatusEnum(),
    timeout: [],
    check_results: checkResultFactory.buildList(2),
  };
});

export const checkResultFactory = Factory.define(() => ({
  check_id: faker.datatype.uuid(),
  result: resultEnum(),
  agents_check_results: agentCheckResultFactory.buildList(2),
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

export const expectationResultFactory = Factory.define(({ sequence }) => ({
  name: `execution_${sequence}`,
  result: faker.datatype.boolean(),
  type: expectationReturnTypeEnum(),
}));

export const executionExpectationEvaluationFactory = Factory.define(
  ({ sequence }) => ({
    name: `execution_${sequence}`,
    return_value: faker.datatype.number(),
    type: expectationReturnTypeEnum(),
  })
);

export const executionFactFactory = Factory.define(() => ({
  check_id: faker.datatype.uuid(),
  name: faker.animal.cat(),
  value: faker.datatype.number(),
}));

export const executionValueFactory = Factory.define(() => ({
  name: faker.animal.cat(),
  value: faker.datatype.number(),
}));
