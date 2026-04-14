import React from 'react';

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DEFAULT_TIMEZONE } from '@lib/timezones';

import { faker } from '@faker-js/faker';

import CheckResultsOverview from '.';

describe('CheckResultsOverview component', () => {
  it('should render a spinner when in loading state', () => {
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

  it('should render an error message', () => {
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

    render(<CheckResultsOverview data={data} catalogDataEmpty />);

    expect(screen.getByText('Checks coming soon')).toBeVisible();
    expect(screen.queryByText('Passing')).not.toBeInTheDocument();
    expect(screen.queryByText('Warning')).not.toBeInTheDocument();
    expect(screen.queryByText('Critical')).not.toBeInTheDocument();
  });

  it('should display a message if no last execution was found', () => {
    render(<CheckResultsOverview catalogDataEmpty={false} />);

    expect(screen.getByText('No check results available.')).toBeVisible();
    expect(screen.queryByText('Passing')).not.toBeInTheDocument();
    expect(screen.queryByText('Warning')).not.toBeInTheDocument();
    expect(screen.queryByText('Critical')).not.toBeInTheDocument();
  });

  it('should display the check results overview', () => {
    const passing_count = faker.number.int();
    const warning_count = faker.number.int();
    const critical_count = faker.number.int();
    const completedAt = '2024-01-10T23:30:00Z';

    const data = {
      completed_at: completedAt,
      passing_count,
      warning_count,
      critical_count,
      status: 'completed',
    };
    render(
      <CheckResultsOverview
        data={data}
        catalogDataEmpty={false}
        timezone={DEFAULT_TIMEZONE}
      />
    );

    expect(screen.getByText('Passing')).toBeVisible();
    expect(screen.getByText(passing_count)).toBeVisible();
    expect(screen.getByText('Warning')).toBeVisible();
    expect(screen.getByText(warning_count)).toBeVisible();
    expect(screen.getByText('Critical')).toBeVisible();
    expect(screen.getByText(critical_count)).toBeVisible();
    expect(screen.getByText('Wed Jan 10, 23:30:00 2024')).toBeVisible();
  });

  it('should display completion time using provided timezone', () => {
    const completedAt = '2024-01-10T23:30:00Z';
    const data = {
      completed_at: completedAt,
      passing_count: faker.number.int(),
      warning_count: faker.number.int(),
      critical_count: faker.number.int(),
      status: 'completed',
    };

    render(
      <CheckResultsOverview
        data={data}
        catalogDataEmpty={false}
        timezone="Pacific/Kiritimati"
      />
    );

    // UTC+14 shifts this timestamp to the next day: 10 Jan -> 11 Jan.
    expect(screen.getByText('Thu Jan 11, 13:30:00 2024')).toBeVisible();
  });
});
