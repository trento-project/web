import React from 'react';
import { render, screen } from '@testing-library/react';

import {
  executionFactFactory,
  executionFactErrorFactory,
} from '@lib/test-utils/factories';

import '@testing-library/jest-dom';
import GatheredFacts from './GatheredFacts';

describe('GatheredFacts Component', () => {
  it('should render check gathered facts', async () => {
    const gatheredFacts = executionFactFactory.buildList(3);

    render(<GatheredFacts gatheredFacts={gatheredFacts} />);

    gatheredFacts.forEach(({ name }) =>
      expect(screen.getByText(name)).toBeVisible()
    );
    expect(screen.getAllByLabelText('property tree')).toHaveLength(3);
  });

  it('should render fact gathering error information', async () => {
    const errorFactGathering = executionFactErrorFactory.build();
    const { message } = errorFactGathering;
    const gatheredFacts = [
      ...executionFactFactory.buildList(3),
      errorFactGathering,
    ];

    render(<GatheredFacts gatheredFacts={gatheredFacts} />);

    gatheredFacts.forEach(({ name }) =>
      expect(screen.getByText(name)).toBeVisible()
    );
    expect(screen.getByText(message)).toBeVisible();
    expect(screen.getAllByLabelText('property tree')).toHaveLength(3);
  });

  it('should handle rendering an empty list of gathered facts', () => {
    render(<GatheredFacts expectedValues={[]} />);

    expect(screen.getByText('No facts were gathered')).toBeVisible();
  });
});
