import React from 'react';

import { screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { renderWithRouter } from '@lib/test-utils';

import ChecksSelectionGroup from './ChecksSelectionGroup';

describe('ClusterDetails ChecksSelectionGroup component', () => {
  it('should show group with selected state', () => {
    const group = 'some-group';

    renderWithRouter(<ChecksSelectionGroup group={group} allSelected={true} />);

    expect(screen.getByText(group)).toBeVisible();
    expect(screen.getByRole('switch')).toBeChecked();
    expect(
      screen.getByRole('switch').classList.contains('bg-jungle-green-500')
    ).toBe(true);
  });

  it('should show group with some selected state', () => {
    const group = 'some-group';

    renderWithRouter(
      <ChecksSelectionGroup
        group={group}
        allSelected={false}
        someSelected={true}
        noneSelected={false}
      />
    );

    expect(screen.getByText(group)).toBeVisible();
    expect(screen.getByRole('switch')).not.toBeChecked();
    expect(screen.getByRole('switch').classList.contains('bg-green-300')).toBe(
      true
    );
  });

  it('should show group with none selected state', () => {
    const group = 'some-group';

    renderWithRouter(
      <ChecksSelectionGroup
        group={group}
        allSelected={false}
        someSelected={false}
        noneSelected={true}
      />
    );

    expect(screen.getByText(group)).toBeVisible();
    expect(screen.getByRole('switch')).not.toBeChecked();
    expect(screen.getByRole('switch').classList.contains('bg-gray-200')).toBe(
      true
    );
  });

  it('should show children checks when the group row is clicked', () => {
    const group = 'some-group';

    renderWithRouter(
      <ChecksSelectionGroup group={group}>{[0,1,2].map(({value}, idx) =>
        <li key={idx}>{value}</li>)}</ChecksSelectionGroup>
    );

    userEvent.click(screen.getByRole('heading').parentNode);
    const groupItem = screen.getAllByRole('list');
    expect(groupItem.length).toBe(1);

    const { getAllByRole } = within(groupItem[0]);
    const checkItems = getAllByRole('listitem');
    expect(checkItems.length).toBe(3);
  });
});
