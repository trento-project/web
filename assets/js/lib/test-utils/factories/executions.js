/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { hostFactory, resultEnum, randomObjectFactory } from '.';

export const checksExecutionStatusEnum = () =>
  faker.helpers.arrayElement(['running', 'completed']);

const expectationReturnTypeEnum = () =>
  faker.helpers.arrayElement(['expect', 'expect_same']);

export const executionValueFactory = Factory.define(({ sequence }) => ({
  name: `${faker.lorem.word()}_${sequence}`,
  value: faker.datatype.number(),
}));

export const executionExpectationEvaluationFactory = Factory.define(
  ({ sequence, params }) => {
    const {
      name = `expectation_${sequence}`,
      failure_message = params.failure_message
        ? { failure_message: params.failure_message }
        : {},
    } = params;

    return {
      name,
      return_value: faker.datatype.number(),
      type: expectationReturnTypeEnum(),
      ...failure_message,
    };
  }
);

export const failingExpectEvaluationFactory = Factory.define(({ params }) =>
  executionExpectationEvaluationFactory.build({
    ...params,
    return_value: false,
    type: 'expect',
    failure_message: faker.lorem.sentence(),
  })
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
    const {
      name = `expectation_${sequence}`,
      failure_message = params.failure_message
        ? { failure_message: params.failure_message }
        : {},
    } = params;

    return {
      name,
      result: faker.datatype.boolean(),
      type: expectationReturnTypeEnum(),
      ...failure_message,
    };
  }
);

export const failingExpectationResultFactory = Factory.define(({ params }) =>
  expectationResultFactory.build({
    ...params,
    result: false,
    type: expectationReturnTypeEnum(),
    failure_message: faker.lorem.sentence(),
  })
);

export const executionFactFactory = Factory.define(({ sequence }) => ({
  check_id: faker.datatype.uuid(),
  name: `${faker.lorem.word()}_${sequence}`,
  value: randomObjectFactory.build({}, { transient: { depth: 5 } }),
}));

export const executionFactErrorFactory = Factory.define(() => ({
  check_id: faker.datatype.uuid(),
  name: faker.lorem.word(),
  type: faker.color.human(),
  message: faker.hacker.phrase(),
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

const checkResultForTarget = (agentId) =>
  agentCheckResultFactory.build({
    agent_id: agentId,
  });

export const checksExecutionCompletedForTargetsFactory = Factory.define(
  ({ params }) => {
    const targets = params.targets || [
      faker.datatype.uuid(),
      faker.datatype.uuid(),
    ];

    const checkResults = params.check_id
      ? params.check_id.map((checkID) =>
          checkResultFactory.build({
            agents_check_results: targets.map(checkResultForTarget),
            check_id: checkID,
          })
        )
      : checkResultFactory.buildList(2, {
          agents_check_results: targets.map(checkResultForTarget),
        });

    return checksExecutionCompletedFactory.build({
      check_results: checkResults,
    });
  }
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

const addExpectation = (checkResult, name, expectation, result) => {
  const { type } = expectation;
  const agents = checkResult.agents_check_results.map((agent) => {
    const evals = [...agent.expectation_evaluations, expectation];

    return {
      ...agent,
      expectation_evaluations: evals,
    };
  });

  const results = [
    ...checkResult.expectation_results,
    expectationResultFactory.build({ name, result, type }),
  ];

  return {
    ...checkResult,
    agents_check_results: agents,
    expectation_results: results,
  };
};

export const addPassingExpectation = (checkResult, type, expectationName) => {
  const name = expectationName || faker.company.name();
  const expectation = executionExpectationEvaluationFactory.build({
    name,
    type,
    return_value: true,
  });

  return addExpectation(checkResult, name, expectation, true);
};

export const addExpectationWithError = (checkResult, expectationName) => {
  const name = expectationName || faker.company.name();
  const expectation = executionExpectationEvaluationErrorFactory.build({
    name,
  });

  return addExpectation(checkResult, name, expectation, false);
};

export const addPassingExpectExpectation = (checkResult, expectationName) =>
  addPassingExpectation(checkResult, 'expect', expectationName);

export const addCriticalExpectExpectation = (checkResult, expectationName) => {
  const name = expectationName || faker.company.name();
  const expectation = failingExpectEvaluationFactory.build({
    name,
  });

  return addExpectation(checkResult, name, expectation, false);
};
export const addPassingExpectSameExpectation = (checkResult, expectationName) =>
  addPassingExpectation(checkResult, 'expect_same', expectationName);

export const agentsCheckResultsWithHostname = (
  agentsCheckResults,
  hostnames = []
) =>
  agentsCheckResults.map((agentCheckResult) => ({
    ...agentCheckResult,
    hostname:
      hostnames.find(({ id }) => agentCheckResult.agent_id === id)?.hostname ||
      hostFactory.build().hostname,
  }));

export const emptyCheckResultFactory = Factory.define(({ params }) => {
  const checkID = params.checkID || faker.datatype.uuid();
  const targets = params.targets || [
    faker.datatype.uuid(),
    faker.datatype.uuid(),
  ];
  const result = params.result || resultEnum();

  const checkResult = checkResultFactory.build({
    check_id: checkID,
    agents_check_results: targets.map(checkResultForTarget),
    result,
  });

  return withEmptyExpectations(checkResult);
});

export const withOverriddenValues = (
  checkResult,
  targetId,
  overriddenValues
) => {
  const overridenResults = checkResult.agents_check_results.map(
    (agentCheckResult) => {
      if (targetId !== agentCheckResult.agent_id) return agentCheckResult;

      return {
        ...agentCheckResult,
        values: overriddenValues,
      };
    }
  );

  return {
    ...checkResult,
    agents_check_results: overridenResults,
  };
};
