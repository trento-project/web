import React from 'react';

import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { faker } from '@faker-js/faker';

import userEvent from '@testing-library/user-event';
import ChecksSelectionHeader from './ChecksSelectionHeader';
import { renderWithRouter } from '../../lib/test-utils';

describe('ChecksSelectionHeader component', () => {
  it('should render a target checks selection header', async () => {
    const user = userEvent.setup();

    const targetID = faker.string.uuid();
    const targetName = faker.lorem.word();
    const selection = [faker.string.uuid(), faker.string.uuid()];
    const savedSelection = [faker.string.uuid()];
    const onSaveSelection = jest.fn();
    const onStartExecution = jest.fn();

    renderWithRouter(
      <ChecksSelectionHeader
        targetID={targetID}
        targetName={targetName}
        backTo={<button type="button">Back to Target Details</button>}
        pageHeader={<div>Target Check Settings</div>}
        isSavingSelection={false}
        selection={selection}
        userAbilities={[{ name: 'all', resource: 'all' }]}
        checkSelectionPermittedFor={['all:all']}
        checkExecutionPermittedFor={['all:all']}
        savedSelection={savedSelection}
        onSaveSelection={onSaveSelection}
        onStartExecution={onStartExecution}
      />
    );

    expect(screen.getByText('Target Check Settings')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Back to Target Details' })
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Save Checks Selection' })
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Start Execution' })
    ).toBeVisible();
    expect(
      screen.queryByText(
        'Click Start Execution or wait for Trento to periodically run checks.'
      )
    ).toBeVisible();

    // Saving a selection
    await user.click(screen.getByText('Save Checks Selection'));

    expect(onSaveSelection).toHaveBeenCalledWith(
      selection,
      targetID,
      targetName
    );

    // Starting an execution
    await user.click(screen.getByText('Start Execution'));

    expect(onStartExecution).toHaveBeenCalled();
  });

  it('should not allow saving a selection', async () => {
    const user = userEvent.setup();

    const targetID = faker.string.uuid();
    const targetName = faker.lorem.word();
    const selection = [faker.string.uuid(), faker.string.uuid()];
    const onSaveSelection = jest.fn();

    renderWithRouter(
      <ChecksSelectionHeader
        targetID={targetID}
        targetName={targetName}
        backTo={<button type="button">Back to Target Details</button>}
        pageHeader={<div>Target Check Settings</div>}
        isSavingSelection
        selection={selection}
        userAbilities={[{ name: 'all', resource: 'all' }]}
        checkSelectionPermittedFor={['all:all']}
        checkExecutionPermittedFor={['all:all']}
        savedSelection={selection}
        onSaveSelection={onSaveSelection}
        onStartExecution={() => {}}
      />
    );

    expect(screen.getByText('Save Checks Selection')).toBeDisabled();

    await user.click(screen.getByText('Save Checks Selection'));

    expect(onSaveSelection).not.toHaveBeenCalled();
  });

  const executionDisallowedScenarios = [
    {
      savedSelection: [],
      isSavingSelection: false,
    },
    {
      savedSelection: [faker.string.uuid()],
      isSavingSelection: true,
    },
    {
      savedSelection: [],
      isSavingSelection: true,
    },
  ];

  it.each(executionDisallowedScenarios)(
    'should not allow starting an execution',
    async ({ savedSelection, isSavingSelection }) => {
      const user = userEvent.setup();

      const targetID = faker.string.uuid();
      const targetName = faker.lorem.word();
      const onStartExecution = jest.fn();

      renderWithRouter(
        <ChecksSelectionHeader
          targetID={targetID}
          targetName={targetName}
          backTo={<button type="button">Back to Target Details</button>}
          pageHeader={<div>Target Check Settings</div>}
          isSavingSelection={isSavingSelection}
          selection={savedSelection}
          userAbilities={[{ name: 'all', resource: 'all' }]}
          checkSelectionPermittedFor={['all:all']}
          checkExecutionPermittedFor={['all:all']}
          savedSelection={savedSelection}
          onSaveSelection={() => {}}
          onStartExecution={onStartExecution}
        />
      );

      expect(screen.getByText('Start Execution')).toBeDisabled();

      await user.click(screen.getByText('Start Execution'));

      expect(onStartExecution).not.toHaveBeenCalled();
    }
  );

  it('should forbid starting a check execution', async () => {
    const user = userEvent.setup();

    const targetID = faker.string.uuid();
    const targetName = faker.lorem.word();
    const selection = [faker.string.uuid(), faker.string.uuid()];
    const onStartExecution = jest.fn();

    renderWithRouter(
      <ChecksSelectionHeader
        targetID={targetID}
        targetName={targetName}
        backTo={<button type="button">Back to Target Details</button>}
        pageHeader={<div>Target Check Settings</div>}
        isSavingSelection
        selection={selection}
        userAbilities={[{ name: 'all', resource: 'other_resource' }]}
        checkSelectionPermittedFor={['all:all']}
        checkExecutionPermittedFor={['all:host_check_execution']}
        savedSelection={selection}
        onSaveSelection={() => {}}
        onStartExecution={onStartExecution}
      />
    );

    expect(screen.getByText('Start Execution')).toBeDisabled();

    await user.click(screen.getByText('Start Execution'));

    expect(onStartExecution).not.toHaveBeenCalled();

    await user.hover(screen.getByText('Start Execution'));

    expect(
      screen.queryByText('You are not authorized for this action')
    ).toBeVisible();
  });

  it('should forbid saving a selection', async () => {
    const user = userEvent.setup();

    const targetID = faker.string.uuid();
    const targetName = faker.lorem.word();
    const selection = [faker.string.uuid(), faker.string.uuid()];
    const onSaveSelection = jest.fn();

    renderWithRouter(
      <ChecksSelectionHeader
        targetID={targetID}
        targetName={targetName}
        backTo={<button type="button">Back to Target Details</button>}
        pageHeader={<div>Target Check Settings</div>}
        isSavingSelection
        selection={selection}
        userAbilities={[]}
        checkSelectionPermittedFor={['all:all']}
        checkExecutionPermittedFor={['all:all']}
        savedSelection={selection}
        onSaveSelection={onSaveSelection}
        onStartExecution={() => {}}
      />
    );

    expect(screen.getByText('Save Checks Selection')).toBeDisabled();

    await user.click(screen.getByText('Save Checks Selection'));

    expect(onSaveSelection).not.toHaveBeenCalled();

    await user.hover(screen.getByText('Save Checks Selection'));

    expect(
      screen.queryByText('You are not authorized for this action')
    ).toBeVisible();
  });
});
