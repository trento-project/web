import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import { faker } from '@faker-js/faker';

import {
  addPassingExpectExpectation,
  addPassingExpectSameExpectation,
  emptyCheckResultFactory,
  agentsCheckResultsWithHostname,
  agentCheckErrorFactory,
  expectationResultFactory,
  catalogExpectExpectationFactory,
  catalogExpectSameExpectationFactory,
} from '@lib/test-utils/factories';

import { renderWithRouter } from '@lib/test-utils';

import '@testing-library/jest-dom';
import CheckResultOutline from './CheckResultOutline';

const expectStatementResult = (expectationName, result) =>
  expectationResultFactory.build({
    name: expectationName,
    type: 'expect',
    result,
  });

const expectSameStatementResult = (expectationName, result) =>
  expectationResultFactory.build({
    name: expectationName,
    type: 'expect_same',
    result,
  });

describe('CheckResultOutline Component', () => {
  it('should render a proper outline for a successful result', async () => {
    const user = userEvent.setup();

    const clusterID = faker.datatype.uuid();
    const checkID = faker.datatype.uuid();
    const clusterName = faker.lorem.word();

    // expectation names are not required to be uuids. using uuids for their uniqueness.
    const expectationName1 = faker.datatype.uuid();
    const expectationName2 = faker.datatype.uuid();
    const expectationName3 = faker.datatype.uuid();
    const expectSameExpectationName1 = faker.datatype.uuid();
    const expectSameExpectationName2 = faker.datatype.uuid();

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
      targets: [faker.datatype.uuid(), faker.datatype.uuid()],
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

  it('should render a proper outline when a fact gathering error occurs', () => {
    const checkID = faker.datatype.uuid();
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
