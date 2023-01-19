import React from 'react';

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { checkFactory } from '@lib/test-utils/factories';

import CheckResult from './CheckResult';

describe('CheckResult component', () => {
  it('should render a single check result', () => {
    const { id, description, executionState, health } = checkFactory.build();

    render(
      <table>
        <tbody>
          <CheckResult
            checkId={id}
            description={description}
            executionState={executionState}
            health={health}
            onClick={() => {}}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText(id)).toBeVisible();
    expect(screen.getByText(description)).toBeVisible();
  });
});
