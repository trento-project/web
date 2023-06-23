import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { faker } from '@faker-js/faker';
import { renderWithRouter } from '@lib/test-utils';
import { catalogCheckFactory } from '@lib/test-utils/factories';

import ChecksSelection from './ChecksSelection';

describe('ChecksSelection component', () => {
  it('should change individual check switches accordingly if the group switch is clicked', async () => {
    const user = userEvent.setup();

    const group = faker.animal.cat();
    const catalog = catalogCheckFactory.buildList(2, { group });

    renderWithRouter(<ChecksSelection catalog={catalog} />);

    const groupItem = await waitFor(() => screen.getByText(group));

    await user.click(groupItem);

    const switches = screen.getAllByRole('switch');

    expect(switches[0]).not.toBeChecked();
    expect(switches[1]).not.toBeChecked();
    expect(switches[2]).not.toBeChecked();

    await user.click(switches[0]);

    const selectedSwitches = screen.getAllByRole('switch');

    expect(selectedSwitches[1]).toBeChecked();
    expect(selectedSwitches[2]).toBeChecked();

    await user.click(switches[0]);

    const unselectedSwitches = screen.getAllByRole('switch');

    expect(unselectedSwitches[1]).not.toBeChecked();
    expect(unselectedSwitches[2]).not.toBeChecked();
  });

  it('should change group check switch accordingly if the children check switches are clicked', async () => {
    const user = userEvent.setup();

    const group = faker.animal.cat();
    const catalog = catalogCheckFactory.buildList(2, { group });
    const selectedChecks = [catalog[0].id, catalog[1].id];

    renderWithRouter(
      <ChecksSelection catalog={catalog} selected={selectedChecks} />
    );

    const groupItem = await waitFor(() => screen.getByText(group));

    await user.click(groupItem);

    const switches = screen.getAllByRole('switch');

    expect(switches[0]).toBeChecked();
    expect(switches[1]).toBeChecked();
    expect(switches[2]).toBeChecked();

    await user.click(switches[1]);

    const offSwitches = screen.getAllByRole('switch');

    expect(offSwitches[0]).not.toBeChecked();

    await user.click(offSwitches[2]);

    expect(screen.getAllByRole('switch')[0]).not.toBeChecked();
  });

  it('should display the error message if any', () => {
    const error = faker.lorem.word();
    const catalog = catalogCheckFactory.buildList(10);

    renderWithRouter(<ChecksSelection catalog={catalog} error={error} />);

    expect(screen.getByText(error)).toBeVisible();
  });

  it('should call the onSave callback when saving the modifications', async () => {
    const onSave = jest.fn();
    const user = userEvent.setup();
    const resourceID = faker.datatype.uuid();

    const group = faker.animal.cat();
    const catalog = catalogCheckFactory.buildList(2, { group });
    const [{ id: checkID1 }, { id: checkID2 }] = catalog;

    renderWithRouter(
      <ChecksSelection
        catalog={catalog}
        resourceID={resourceID}
        onSave={onSave}
      />
    );

    const switches = screen.getAllByRole('switch');

    await user.click(switches[0]);
    await user.click(screen.getByText('Select Checks for Execution'));

    expect(onSave).toBeCalledWith([checkID1, checkID2], resourceID);
  });
});
