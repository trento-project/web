import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

const healthEnum = () =>
  faker.helpers.arrayElement(['requested', 'running', 'not_running']);

const resultEnum = () =>
  faker.helpers.arrayElement(['passing', 'critical', 'warning']);

export const checkFactory = Factory.define(() => ({
  id: faker.datatype.uuid(),
  description: faker.lorem.paragraph(),
  executionState: healthEnum,
  health: healthEnum,
}));

export const healthSummaryFactory = Factory.define(() => ({
  clusterId: faker.datatype.uuid(),
  clustersHealth: healthEnum(),
  databaseHealth: healthEnum(),
  databaseId: faker.datatype.uuid(),
  hostsHealth: healthEnum(),
  id: faker.datatype.uuid(),
  sapsystemHealth: healthEnum(),
  sid: faker.random.alphaNumeric({
    length: 3,
    casing: 'upper',
  }),
}));

export const catalogCheckFactory = Factory.define(() => ({
  id: faker.datatype.uuid(),
  name: faker.animal.cat(),
  group: faker.animal.cat(),
  description: faker.lorem.paragraph(),
  remediation: faker.lorem.paragraph(),
}));

export const checksExecutionStatusEnum = () =>
  faker.helpers.arrayElement(['running', 'completed']);

export const checksExecutionFactory = Factory.define(({ params }) => {
  const {
    agentID = faker.datatype.uuid(),
    groupID = faker.datatype.uuid(),
    executionID = faker.datatype.uuid(),
    checkID = faker.datatype.uuid(),
  } = params;

  return {
    completed_at: '2022-11-09T17:02:20.629366Z',
    execution_id: executionID,
    group_id: groupID,
    result: resultEnum(),
    started_at: '2022-11-09T15:11:31.436586Z',
    status: checksExecutionStatusEnum(),
    timeout: [],
    check_results: [
      {
        agents_check_results: [
          {
            agent_id: agentID,
            expectation_evaluations: [
              {
                name: 'expectation_example',
                return_value: 123,
                type: 'expect',
              },
            ],
            facts: [
              { check_id: checkID, name: 'lol_this_is_a_fact', value: 123 },
            ],
            values: [],
          },
        ],
        check_id: checkID,
        expectation_results: [
          { name: 'expectation_example', result: true, type: 'expect' },
        ],
        result: resultEnum(),
      },
    ],
  };
});

export const hostnameFactory = Factory.define(() => ({
  id: faker.datatype.uuid(),
  hostname: faker.hacker.noun(),
}));

export const aboutFactory = Factory.define(() => ({
  flavor: faker.animal.cat(),
  sles_subscriptions: faker.datatype.number(),
  version: faker.system.networkInterface(),
}));

export const clusterFactory = Factory.define(() => ({
  id: faker.datatype.uuid(),
  selected_checks: [],
}));
