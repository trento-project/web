import React from 'react';

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';

import { catalogCheckFactory } from '@lib/test-utils/factories';

import CheckResultsOverview from '.';

describe('CheckResultsOverview component', () => {
  it('should render a spinner when catalog is in loading state', () => {
    render(<CheckResultsOverview catalogLoading />);

    expect(screen.getByRole('alert')).toBeVisible();
    expect(screen.queryByText('Check Summary')).toBeInTheDocument();
    expect(
      screen.queryByText('Checks execution running...')
    ).toBeInTheDocument();
    expect(screen.queryByText('Passing')).not.toBeInTheDocument();
    expect(screen.queryByText('Warning')).not.toBeInTheDocument();
    expect(screen.queryByText('Critical')).not.toBeInTheDocument();
  });

  it('should render a spinner when execution is in loading state', () => {
    render(<CheckResultsOverview loading />);

    expect(screen.getByRole('alert')).toBeVisible();
    expect(screen.queryByText('Check Summary')).toBeInTheDocument();
    expect(
      screen.queryByText('Checks execution running...')
    ).toBeInTheDocument();
    expect(screen.queryByText('Passing')).not.toBeInTheDocument();
    expect(screen.queryByText('Warning')).not.toBeInTheDocument();
    expect(screen.queryByText('Critical')).not.toBeInTheDocument();
  });

  it('should render an error message when a catalog error occurred', () => {
    const error = faker.hacker.noun();
    render(<CheckResultsOverview catalogError={error} />);

    expect(screen.getByText(error)).toBeVisible();
    expect(screen.queryByText('Passing')).not.toBeInTheDocument();
    expect(screen.queryByText('Warning')).not.toBeInTheDocument();
    expect(screen.queryByText('Critical')).not.toBeInTheDocument();
  });

  it('should render an error message when an execution error occurred', () => {
    const error = faker.hacker.noun();
    render(<CheckResultsOverview error={error} />);

    expect(screen.getByText(error)).toBeVisible();
    expect(screen.queryByText('Passing')).not.toBeInTheDocument();
    expect(screen.queryByText('Warning')).not.toBeInTheDocument();
    expect(screen.queryByText('Critical')).not.toBeInTheDocument();
  });

  it('should display a message if no checks are present in the catalog', () => {
    const passing_count = faker.number.int();
    const warning_count = faker.number.int();
    const critical_count = faker.number.int();

    const data = {
      completed_at: faker.date.past().toISOString(),
      passing_count,
      warning_count,
      critical_count,
      status: 'completed',
    };

    render(<CheckResultsOverview data={data} catalogData={[]} />);

    expect(screen.getByText('Checks coming soon')).toBeVisible();
    expect(screen.queryByText('Passing')).not.toBeInTheDocument();
    expect(screen.queryByText('Warning')).not.toBeInTheDocument();
    expect(screen.queryByText('Critical')).not.toBeInTheDocument();
  });

  it('should display a message if no last execution was found', () => {
    render(
      <CheckResultsOverview catalogData={[catalogCheckFactory.build()]} />
    );

    expect(screen.getByText('No check results available.')).toBeVisible();
    expect(screen.queryByText('Passing')).not.toBeInTheDocument();
    expect(screen.queryByText('Warning')).not.toBeInTheDocument();
    expect(screen.queryByText('Critical')).not.toBeInTheDocument();
  });

  it('should display the check results overview', () => {
    const passing_count = faker.number.int();
    const warning_count = faker.number.int();
    const critical_count = faker.number.int();

    const data = {
      completed_at: faker.date.past().toISOString(),
      passing_count,
      warning_count,
      critical_count,
      status: 'completed',
    };

    render(
      <CheckResultsOverview
        data={data}
        catalogData={[catalogCheckFactory.build()]}
      />
    );

    expect(screen.getByText('Passing')).toBeVisible();
    expect(screen.getByText(passing_count)).toBeVisible();
    expect(screen.getByText('Warning')).toBeVisible();
    expect(screen.getByText(warning_count)).toBeVisible();
    expect(screen.getByText('Critical')).toBeVisible();
    expect(screen.getByText(critical_count)).toBeVisible();
  });
});
