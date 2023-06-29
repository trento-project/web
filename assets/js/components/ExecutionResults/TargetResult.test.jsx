import React from 'react';
import { render, screen } from '@testing-library/react';

import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';

import { faker } from '@faker-js/faker';

import '@testing-library/jest-dom';
import TargetResult from './TargetResult';

describe('TargetResult Component', () => {
  it('should render a clickable Target result', async () => {
    const user = userEvent.setup();

    const isCluster = false;
    const targetName = faker.lorem.word();
    const expectationsSummary = faker.lorem.sentence();
    const onClick = jest.fn();

    render(
      <TargetResult
        isCluster={isCluster}
        targetName={targetName}
        expectationsSummary={expectationsSummary}
        onClick={onClick}
      />
    );

    expect(screen.getByText(targetName)).toBeTruthy();
    expect(screen.getByText(expectationsSummary)).toBeTruthy();

    await act(async () => user.click(screen.getByTestId('target-result')));

    expect(onClick).toHaveBeenCalled();
  });
});
