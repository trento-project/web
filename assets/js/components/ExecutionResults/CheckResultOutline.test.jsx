import React from 'react';
import { render, screen } from '@testing-library/react';

import { faker } from '@faker-js/faker';

import {
  catalogExpectExpectation,
  catalogExpectSameExpectation,
  addPassingExpectExpectation,
  addPassingExpectSameExpectation,
  emptyCheckResultFactory,
  expectExpectationResult,
  expectSameExpectationResult,
  agentsCheckResultsWithHostname,
  agentCheckErrorFactory,
} from '@lib/test-utils/factories';

import '@testing-library/jest-dom';
import CheckResultOutline from './CheckResultOutline';

describe('CheckResultOutline Component', () => {
  it('should render a proper outline for a successful result', () => {
    const checkID = faker.datatype.uuid();
    const clusterName = faker.animal.bear();

    const expectationName1 = faker.company.name();
    const expectationName2 = faker.color.human();
    const expectationName3 = faker.color.human();
    const expectSameExpectationName1 = faker.lorem.word();
    const expectSameExpectationName2 = faker.lorem.word();

    const expectations = [
      catalogExpectExpectation(expectationName1),
      catalogExpectExpectation(expectationName2),
      catalogExpectExpectation(expectationName3),
      catalogExpectSameExpectation(expectSameExpectationName1),
      catalogExpectSameExpectation(expectSameExpectationName2),
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
      expectExpectationResult(expectationName1, true),
      expectExpectationResult(expectationName2, true),
      expectSameExpectationResult(expectSameExpectationName1, true),
      expectSameExpectationResult(expectSameExpectationName2, true),
    ];

    render(
      <CheckResultOutline
        checkID={checkID}
        clusterName={clusterName}
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
  });

  it('should render a proper outline when a fact gathering error occurs', () => {
    const checkID = faker.datatype.uuid();
    const clusterName = faker.animal.bear();

    const expectationName1 = faker.company.name();
    const expectationName2 = faker.color.human();

    const expectations = [
      catalogExpectExpectation(expectationName1),
      catalogExpectExpectation(expectationName2),
    ];

    const agentsCheckResults = agentsCheckResultsWithHostname(
      agentCheckErrorFactory.buildList(2)
    );

    const [
      { hostname: hostname1, message: message1 },
      { hostname: hostname2, message: message2 },
    ] = agentsCheckResults;

    const expectationResults = [];

    render(
      <CheckResultOutline
        checkID={checkID}
        clusterName={clusterName}
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
