import React, { act } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { faker } from '@faker-js/faker';

import {
  EXPECT,
  EXPECT_SAME,
  EXPECT_ENUM,
  PASSING,
  CRITICAL,
} from '@lib/model';

import {
  addExpectationWithResult,
  addPassingExpectExpectation,
  addPassingExpectSameExpectation,
  emptyCheckResultFactory,
  agentsCheckResultsWithHostname,
  agentCheckErrorFactory,
  expectationResultFactory,
  catalogExpectExpectationFactory,
  catalogExpectSameExpectationFactory,
  catalogExpectEnumExpectationFactory,
} from '@lib/test-utils/factories';

import { renderWithRouter } from '@lib/test-utils';

import '@testing-library/jest-dom';
import CheckResultOutline from './CheckResultOutline';

const expectStatementResult = (expectationName, result) =>
  expectationResultFactory.build({
    name: expectationName,
    type: EXPECT,
    result,
  });

const expectSameStatementResult = (expectationName, result) =>
  expectationResultFactory.build({
    name: expectationName,
    type: EXPECT_SAME,
    result,
  });

const expectEnumStatementResult = (expectationName, result) =>
  expectationResultFactory.build({
    name: expectationName,
    type: EXPECT_ENUM,
    result,
  });

describe('CheckResultOutline Component', () => {
  it('should render a proper outline for a successful cluster check result', async () => {
    const user = userEvent.setup();

    const clusterID = faker.string.uuid();
    const checkID = faker.string.uuid();
    const clusterName = faker.lorem.word();

    // expectation names are not required to be uuids. using uuids for their uniqueness.
    const expectationName1 = faker.string.uuid();
    const expectationName2 = faker.string.uuid();
    const expectationName3 = faker.string.uuid();
    const expectSameExpectationName1 = faker.string.uuid();
    const expectSameExpectationName2 = faker.string.uuid();

    const expectations = [
      catalogExpectExpectationFactory.build({
        name: expectationName1,
      }),
      catalogExpectExpectationFactory.build({
        name: expectationName2,
      }),
      catalogExpectExpectationFactory.build({
        name: expectationName3,
      }),
      catalogExpectSameExpectationFactory.build({
        name: expectSameExpectationName1,
      }),
      catalogExpectSameExpectationFactory.build({
        name: expectSameExpectationName2,
      }),
    ];

    let checkResult = emptyCheckResultFactory.build({
      checkID,
      targets: [faker.string.uuid(), faker.string.uuid()],
      result: 'passing',
    });
    checkResult = addPassingExpectExpectation(checkResult, expectationName1);
    checkResult = addPassingExpectExpectation(checkResult, expectationName2);
    checkResult = addPassingExpectExpectation(checkResult, expectationName3);
    checkResult = addPassingExpectSameExpectation(
      checkResult,
      expectSameExpectationName1
    );
    checkResult = addPassingExpectSameExpectation(
      checkResult,
      expectSameExpectationName2
    );

    const agentsCheckResults = agentsCheckResultsWithHostname(
      checkResult.agents_check_results
    );

    const expectationResults = [
      expectStatementResult(expectationName1, true),
      expectStatementResult(expectationName2, true),
      expectSameStatementResult(expectSameExpectationName1, true),
      expectSameStatementResult(expectSameExpectationName2, true),
    ];

    renderWithRouter(
      <CheckResultOutline
        targetID={clusterID}
        checkID={checkID}
        targetName={clusterName}
        targetType="cluster"
        expectations={expectations}
        agentsCheckResults={agentsCheckResults}
        expectationResults={expectationResults}
      />
    );

    expect(screen.getAllByText(clusterName)).toHaveLength(2);
    expect(
      screen.getAllByText(
        `Value \`${expectSameExpectationName1}\` is the same on all targets`
      )
    ).toHaveLength(1);
    expect(
      screen.getAllByText(
        `Value \`${expectSameExpectationName2}\` is the same on all targets`
      )
    ).toHaveLength(1);
    expect(screen.getAllByText('3/3 Expectations met.')).toHaveLength(2);

    await act(async () => user.click(screen.getAllByText(clusterName)[0]));

    expect(window.location.pathname).toEqual(
      `/clusters/${clusterID}/executions/last/${checkID}/cluster/${clusterName}`
    );
  });

  it('should render a proper outline for a successful host check result', async () => {
    const user = userEvent.setup();

    const hostID = faker.string.uuid();
    const hostName = faker.lorem.word();
    const checkID = faker.string.uuid();

    const expectations = [
      catalogExpectExpectationFactory.build(),
      catalogExpectEnumExpectationFactory.build(),
      catalogExpectEnumExpectationFactory.build(),
    ];

    const [
      { name: expectationName1 },
      { name: expectationName2 },
      { name: expectationName3 },
    ] = expectations;

    let checkResult = emptyCheckResultFactory.build({
      checkID,
      targets: [hostID],
      result: 'passing',
    });

    checkResult = addPassingExpectExpectation(checkResult, expectationName1);
    checkResult = addExpectationWithResult(
      checkResult,
      EXPECT_ENUM,
      expectationName2,
      PASSING
    );
    checkResult = addExpectationWithResult(
      checkResult,
      EXPECT_ENUM,
      expectationName3,
      CRITICAL
    );

    const agentsCheckResults = agentsCheckResultsWithHostname(
      checkResult.agents_check_results,
      [{ id: hostID, hostname: hostName }]
    );

    const expectationResults = [
      expectStatementResult(expectationName1, true),
      expectEnumStatementResult(expectationName2, PASSING),
      expectEnumStatementResult(expectationName3, CRITICAL),
    ];

    renderWithRouter(
      <CheckResultOutline
        targetID={hostID}
        checkID={checkID}
        targetName={hostName}
        targetType="host"
        expectations={expectations}
        agentsCheckResults={agentsCheckResults}
        expectationResults={expectationResults}
      />
    );

    expect(screen.getAllByText(hostName)).toHaveLength(1);
    expect(screen.getAllByText('2/3 Expectations met.')).toHaveLength(1);

    await act(async () => user.click(screen.getAllByText(hostName)[0]));

    expect(window.location.pathname).toEqual(
      `/hosts/${hostID}/executions/last/${checkID}/host/${hostName}`
    );
  });

  it('should render a proper outline when a fact gathering error occurs', () => {
    const checkID = faker.string.uuid();
    const clusterName = faker.animal.bear();

    const expectationName1 = faker.company.name();
    const expectationName2 = faker.color.human();

    const expectations = [
      catalogExpectExpectationFactory.build({
        name: expectationName1,
      }),
      catalogExpectExpectationFactory.build({
        name: expectationName2,
      }),
    ];

    const agentsCheckResults = agentsCheckResultsWithHostname(
      agentCheckErrorFactory.buildList(2)
    );

    const [
      { hostname: hostname1, message: message1 },
      { hostname: hostname2, message: message2 },
    ] = agentsCheckResults;

    const expectationResults = [];

    renderWithRouter(
      <CheckResultOutline
        checkID={checkID}
        targetName={clusterName}
        expectations={expectations}
        agentsCheckResults={agentsCheckResults}
        expectationResults={expectationResults}
      />
    );

    expect(screen.getAllByText(hostname1)).toHaveLength(1);
    expect(screen.getAllByText(hostname2)).toHaveLength(1);

    expect(screen.getAllByText(message1)).toHaveLength(1);
    expect(screen.getAllByText(message2)).toHaveLength(1);
  });
});
