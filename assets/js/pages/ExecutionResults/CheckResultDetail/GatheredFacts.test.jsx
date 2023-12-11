import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import {
  executionFactFactory,
  executionFactErrorFactory,
  hostFactory,
} from '@lib/test-utils/factories';

import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import GatheredFacts from './GatheredFacts';

describe('GatheredFacts Component', () => {
  it('should render check gathered facts', async () => {
    const gatheredFacts = executionFactFactory.buildList(3);

    render(<GatheredFacts isTargetHost gatheredFacts={gatheredFacts} />);

    gatheredFacts.forEach(({ name }) =>
      expect(screen.getByText(name)).toBeVisible()
    );
    expect(screen.getAllByLabelText('property tree')).toHaveLength(3);
  });

  it('should render cluster wide check gathered facts', () => {
    const [{ hostname: hostname1 }, { hostname: hostname2 }] =
      hostFactory.buildList(2);
    const expectationName = faker.lorem.word();
    const anotherExpectationName = faker.hacker.noun();
    const gatheredFacts = [
      {
        name: expectationName,
        value: {
          [expectationName]: {
            [hostname1]: faker.lorem.word(),
            [hostname2]: faker.lorem.sentence(),
          },
        },
      },
      {
        name: anotherExpectationName,
        value: {
          [anotherExpectationName]: {
            [hostname1]: faker.lorem.sentence(),
            [hostname2]: faker.lorem.word(),
          },
        },
      },
    ];

    render(
      <GatheredFacts isTargetHost={false} gatheredFacts={gatheredFacts} />
    );

    expect(screen.getByText(expectationName)).toBeVisible();
    expect(screen.getByText(anotherExpectationName)).toBeVisible();
    expect(screen.getAllByLabelText('property tree')).toHaveLength(2);

    fireEvent.click(screen.getByText(anotherExpectationName));
    expect(screen.queryByText(hostname1)).toBeVisible();
    expect(screen.queryByText(hostname2)).toBeVisible();
  });

  it('should render fact gathering error information', () => {
    const errorFactGathering = executionFactErrorFactory.build();
    const { message } = errorFactGathering;
    const gatheredFacts = [
      ...executionFactFactory.buildList(3),
      errorFactGathering,
    ];

    render(<GatheredFacts isTargetHost gatheredFacts={gatheredFacts} />);

    gatheredFacts.forEach(({ name }) =>
      expect(screen.getByText(name)).toBeVisible()
    );
    expect(screen.getByText(message)).toBeVisible();
    expect(screen.getAllByLabelText('property tree')).toHaveLength(3);
  });

  it.each([{ isTargetHost: true }, { isTargetHost: false }])(
    'should handle rendering an empty list of gathered facts',
    ({ isTargetHost }) => {
      render(<GatheredFacts isTargetHost={isTargetHost} expectedValues={[]} />);

      expect(screen.getByText('No facts were gathered')).toBeVisible();
    }
  );
});
