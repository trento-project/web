/* eslint-disable react/no-array-index-key */
import React from 'react';

import { screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { renderWithRouter } from '@lib/test-utils';

import ChecksSelectionGroup, {
  NONE_CHECKED,
  SOME_CHECKED,
  ALL_CHECKED,
} from './ChecksSelectionGroup';

describe('ClusterDetails ChecksSelectionGroup component', () => {
  it('should show group with selected state', () => {
    const group = 'some-group';

    renderWithRouter(
      <ChecksSelectionGroup group={group} selected={ALL_CHECKED} />
    );

    expect(screen.getByText(group)).toBeVisible();
    expect(screen.getByRole('switch')).toBeChecked();
    expect(
      screen.getByRole('switch').classList.contains('bg-jungle-green-500')
    ).toBe(true);
  });

  it('should show group with some selected state', () => {
    const group = 'some-group';

    renderWithRouter(
      <ChecksSelectionGroup group={group} selected={SOME_CHECKED} />
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
      <ChecksSelectionGroup group={group} selected={NONE_CHECKED} />
    );

    expect(screen.getByText(group)).toBeVisible();
    expect(screen.getByRole('switch')).not.toBeChecked();
    expect(screen.getByRole('switch').classList.contains('bg-gray-200')).toBe(
      true
    );
  });

  it('should show children checks when the group row is clicked', async () => {
    const user = userEvent.setup();
    const group = 'some-group';

    renderWithRouter(
      <ChecksSelectionGroup group={group}>
        {[0, 1, 2].map(({ value }, idx) => (
          <li key={idx}>{value}</li>
        ))}
      </ChecksSelectionGroup>
    );

    await user.click(screen.getByRole('heading').parentNode);
    const groupItem = screen.getAllByRole('list');
    expect(groupItem.length).toBe(1);

    const { getAllByRole } = within(groupItem[0]);
    const checkItems = getAllByRole('listitem');
    expect(checkItems.length).toBe(3);
  });

  it('should run the onChange function when the switch button is clicked', async () => {
    const group = 'some-group';
    const onChangeMock = jest.fn();
    const user = userEvent.setup();

    renderWithRouter(
      <ChecksSelectionGroup group={group} onChange={onChangeMock} />
    );

    await user.click(screen.getByRole('switch'));
    expect(onChangeMock).toBeCalled();
  });
});
