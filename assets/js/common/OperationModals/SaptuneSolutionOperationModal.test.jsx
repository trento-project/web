import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import {
  SAPTUNE_SOLUTION_APPLY,
  SAPTUNE_SOLUTION_CHANGE,
} from '@lib/operations';
import SaptuneSolutionOperationModal from './SaptuneSolutionOperationModal';

describe('SaptuneSolutionOperationModal', () => {
  it.each`
    operation                  | title
    ${SAPTUNE_SOLUTION_APPLY}  | ${'Apply Saptune solution'}
    ${SAPTUNE_SOLUTION_CHANGE} | ${'Change Saptune solution'}
  `(
    'should show correct title and description',
    async ({ operation, title }) => {
      render(<SaptuneSolutionOperationModal operation={operation} isOpen />);

      expect(screen.getByText(title)).toBeInTheDocument();
      expect(
        screen.getByText('Select Saptune tuning solution')
      ).toBeInTheDocument();
    }
  );

  it('should forbid selecting a solution until accepting liability disclaimer', async () => {
    const user = userEvent.setup();

    render(
      <SaptuneSolutionOperationModal
        operation={SAPTUNE_SOLUTION_APPLY}
        isOpen
      />
    );

    expect(screen.getByText('Apply')).toBeDisabled();
    expect(screen.getByText('Select a saptune solution')).toBeDisabled();

    await user.click(screen.getByRole('checkbox'));

    expect(screen.getByText('Select a saptune solution')).toBeEnabled();
    expect(screen.getByText('Apply')).toBeDisabled();
  });

  it('should forbid applying a solution until one is actually selected', async () => {
    const user = userEvent.setup();

    render(
      <SaptuneSolutionOperationModal
        operation={SAPTUNE_SOLUTION_APPLY}
        isOpen
        isAppRunning
      />
    );

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByText('Select a saptune solution'));
    await user.click(screen.getByText('NETWEAVER'));

    expect(screen.getByText('Apply')).toBeEnabled();
  });

  it('should reset internal state when closing the modal', async () => {
    const user = userEvent.setup();

    const { rerender } = await act(async () =>
      render(
        <SaptuneSolutionOperationModal
          operation={SAPTUNE_SOLUTION_APPLY}
          isOpen
          isAppRunning
        />
      )
    );

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByText('Select a saptune solution'));
    await user.click(screen.getByText('NETWEAVER'));

    await user.click(screen.getByText('Cancel'));

    await act(async () =>
      rerender(
        <SaptuneSolutionOperationModal
          operation={SAPTUNE_SOLUTION_APPLY}
          isOpen
          isAppRunning
        />
      )
    );

    await waitFor(() => {
      expect(screen.getByText('Apply')).toBeDisabled();
      expect(screen.getByText('Select a saptune solution')).toBeDisabled();
    });
  });

  it('should call onCancel callback', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    await act(async () =>
      render(
        <SaptuneSolutionOperationModal
          operation={SAPTUNE_SOLUTION_APPLY}
          isOpen
          isAppRunning
          onCancel={onCancel}
        />
      )
    );

    await user.click(screen.getByText('Cancel'));

    expect(onCancel).toHaveBeenCalled();
  });

  it('should render HANA solutions', async () => {
    const user = userEvent.setup();
    const mockOnRequest = jest.fn();

    render(
      <SaptuneSolutionOperationModal
        operation={SAPTUNE_SOLUTION_APPLY}
        isOpen
        isHanaRunning
        onRequest={mockOnRequest}
      />
    );

    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByText('Apply')).toBeDisabled();

    await user.click(screen.getByText('Select a saptune solution'));

    expect(screen.getByText('HANA')).toBeInTheDocument();
    expect(screen.getByText('S4HANA-DBSERVER')).toBeInTheDocument();

    await user.click(screen.getByText('HANA'));
    await user.click(screen.getByText('Apply'));

    expect(mockOnRequest).toHaveBeenCalledWith('HANA');
  });

  it('should render Application solutions', async () => {
    const user = userEvent.setup();

    render(
      <SaptuneSolutionOperationModal
        operation={SAPTUNE_SOLUTION_APPLY}
        isOpen
        isAppRunning
      />
    );

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByText('Select a saptune solution'));

    expect(screen.getByText('NETWEAVER')).toBeInTheDocument();
    expect(screen.getByText('S4HANA-APPSERVER')).toBeInTheDocument();
  });

  it('should render HANA and Application solutions', async () => {
    const user = userEvent.setup();

    render(
      <SaptuneSolutionOperationModal
        operation={SAPTUNE_SOLUTION_APPLY}
        isOpen
        isHanaRunning
        isAppRunning
      />
    );

    await waitFor(async () => {
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByText('Select a saptune solution'));

      expect(screen.getByText('S4HANA-APP+DB')).toBeInTheDocument();
      expect(screen.getByText('NETWEAVER+HANA')).toBeInTheDocument();
    });
  });

  it('should render proper options when a solution is currently applied', async () => {
    const user = userEvent.setup();

    render(
      <SaptuneSolutionOperationModal
        operation={SAPTUNE_SOLUTION_APPLY}
        isOpen
        isHanaRunning
        currentlyApplied="HANA"
      />
    );

    expect(screen.getByRole('button', { name: 'HANA' })).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'HANA' }));

    expect(
      screen.queryByText('Select a saptune solution')
    ).not.toBeInTheDocument();
  });

  it('currently applied solution should be disabled', async () => {
    const user = userEvent.setup();

    render(
      <SaptuneSolutionOperationModal
        operation={SAPTUNE_SOLUTION_APPLY}
        isOpen
        isHanaRunning
        currentlyApplied="HANA"
      />
    );

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'HANA' }));

    expect(screen.getByRole('option', { name: 'HANA' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
});
