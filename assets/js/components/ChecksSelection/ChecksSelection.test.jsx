import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { faker } from '@faker-js/faker';
import { renderWithRouter } from '@lib/test-utils';
import { catalogCheckFactory } from '@lib/test-utils/factories';

import ChecksSelection, { canStartExecution } from '.';

describe('ChecksSelection component', () => {
  it('should select the checks passed as props', async () => {
    const user = userEvent.setup();

    const group = faker.animal.cat();
    const catalog = catalogCheckFactory.buildList(2, { group });
    const selectedChecks = catalog.map(({ id }) => id);

    const onUpdateCatalog = jest.fn();

    renderWithRouter(
      <ChecksSelection
        catalog={catalog}
        selectedChecks={selectedChecks}
        onUpdateCatalog={onUpdateCatalog}
        onChange={() => {}}
      />
    );

    const groupItem = await waitFor(() => screen.getByText(group));

    await user.click(groupItem);

    const switches = screen.getAllByRole('switch');

    expect(switches[0]).toBeChecked();
    expect(switches[1]).toBeChecked();
    expect(switches[2]).toBeChecked();
  });

  it('should select a whole group of checks', async () => {
    const user = userEvent.setup();

    const group = faker.animal.cat();
    const catalog = catalogCheckFactory.buildList(2, { group });
    const selectionSet = [catalog[0].id, catalog[1].id];

    const onUpdateCatalog = jest.fn();
    const onChange = jest.fn();

    renderWithRouter(
      <ChecksSelection
        catalog={catalog}
        selectedChecks={[]}
        onUpdateCatalog={onUpdateCatalog}
        onChange={onChange}
      />
    );

    const groupItem = await waitFor(() => screen.getByText(group));

    await user.click(groupItem);

    const switches = screen.getAllByRole('switch');

    expect(switches[0]).not.toBeChecked();
    expect(switches[1]).not.toBeChecked();
    expect(switches[2]).not.toBeChecked();

    await user.click(switches[0]);
    expect(onChange).toHaveBeenCalledWith(selectionSet);
  });

  it('should select a single check', async () => {
    const user = userEvent.setup();

    const group = faker.animal.cat();
    const catalog = catalogCheckFactory.buildList(2, { group });

    const onUpdateCatalog = jest.fn();
    const onChange = jest.fn();

    renderWithRouter(
      <ChecksSelection
        catalog={catalog}
        selectedChecks={[]}
        onUpdateCatalog={onUpdateCatalog}
        onChange={onChange}
      />
    );

    const groupItem = await waitFor(() => screen.getByText(group));

    await user.click(groupItem);

    const switches = screen.getAllByRole('switch');

    expect(switches[0]).not.toBeChecked();
    expect(switches[1]).not.toBeChecked();
    expect(switches[2]).not.toBeChecked();

    await user.click(switches[1]);
    expect(onChange).toHaveBeenCalledWith([catalog[0].id]);
  });

  it('should deselect a whole group when clicking on it', async () => {
    const user = userEvent.setup();

    const group = faker.animal.cat();
    const catalog = catalogCheckFactory.buildList(2, { group });
    const selectedChecks = catalog.map(({ id }) => id);

    const onUpdateCatalog = jest.fn();
    const onChange = jest.fn();

    renderWithRouter(
      <ChecksSelection
        catalog={catalog}
        selectedChecks={selectedChecks}
        onUpdateCatalog={onUpdateCatalog}
        onChange={onChange}
      />
    );

    const groupItem = await waitFor(() => screen.getByText(group));

    await user.click(groupItem);

    const switches = screen.getAllByRole('switch');

    expect(switches[0]).toBeChecked();
    expect(switches[1]).toBeChecked();
    expect(switches[2]).toBeChecked();

    await user.click(switches[0]);
    expect(onChange).toHaveBeenCalledWith([]);
  });
});

describe('canStartExecution function', () => {
  it('should not allow an execution if selected checks are empty and not saving', () => {
    const selectedChecks = [];
    const saving = false;

    expect(canStartExecution(selectedChecks, saving)).toBe(false);
  });

  it('should not allow an execution if selected checks are empty and not saving', () => {
    const selectedChecks = [];
    const saving = true;

    expect(canStartExecution(selectedChecks, saving)).toBe(false);
  });

  it('should not allow an execution if selected checks are populated and saving', () => {
    const selectedChecks = [faker.string.uuid()];
    const saving = true;

    expect(canStartExecution(selectedChecks, saving)).toBe(false);
  });

  it('should allow an execution if selected checks are empty and not saving', () => {
    const selectedChecks = [faker.string.uuid()];
    const saving = false;

    expect(canStartExecution(selectedChecks, saving)).toBe(true);
  });
});
