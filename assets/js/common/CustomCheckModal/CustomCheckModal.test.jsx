import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { catalogValueFactory } from '@lib/test-utils/factories';
import CustomCheckModal from './CustomCheckModal';

const mockOnClose = jest.fn();
const mockOnSave = jest.fn();

const expectedCheckModalValues = {
  open: true,
  selectedCheckID: '123',
  selectedCheckValues: [
    catalogValueFactory.build({
      name: 'CheckValueName',
      default: '10',
      customizable: true,
    }),
  ],
  selectedCheckDescription: 'Check Description',
  provider: 'aws',
  onClose: mockOnClose,
  onSave: mockOnSave,
};

describe('CustomCheckModal', () => {
  test('renders modal with correct title, description, warning, disabled input field and a disabled save button', async () => {
    const expectedModalTitle = `Check: ${expectedCheckModalValues.selectedCheckID}`;
    const expectedWarningBannerText =
      'Trento & SUSE cannot be held liable for damages if system is unable to function due to custom check value.';
    const user = userEvent.setup();

    await act(async () => {
      render(<CustomCheckModal {...expectedCheckModalValues} />);
    });

    expect(screen.getByText(expectedModalTitle)).toBeInTheDocument();
    expect(
      screen.getByText(expectedCheckModalValues.selectedCheckDescription)
    ).toBeInTheDocument();
    expect(screen.getByText(expectedWarningBannerText)).toBeInTheDocument();
    const warningBannerCheckbox = screen.getByRole('checkbox');
    expect(warningBannerCheckbox).not.toBeChecked();
    expect(screen.getByText('Save')).toBeDisabled();

    const inputElements = screen.getAllByRole('textbox'); // All modal inputs
    expect(inputElements[0]).toBeDisabled(); // Customizable check value
    expect(inputElements[1]).toBeDisabled(); // Provider is always disabled

    await user.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('renders the modal  with a single customizable values', async () => {
    const user = userEvent.setup();
    const customCheckValue = '123';
    const { onSave } = expectedCheckModalValues;

    await act(async () => {
      render(<CustomCheckModal {...expectedCheckModalValues} />);
    });

    const warningBannerCheckbox = screen.getByRole('checkbox');
    expect(warningBannerCheckbox).not.toBeChecked();
    await user.click(warningBannerCheckbox);
    expect(warningBannerCheckbox).toBeChecked();
    const inputElements = screen.getAllByRole('textbox');
    expect(inputElements[0]).toBeEnabled(); // first customizable check values
    expect(inputElements[1]).toBeDisabled(); // Provider is always disabled
    await user.type(inputElements[0], customCheckValue);

    await user.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledWith({
      checksID: '123',
      customValues: { CheckValueName: '123' },
    });
  });

  test('renders the modal with multiple customizable values', async () => {
    const user = userEvent.setup();
    const { onSave } = expectedCheckModalValues;
    const customCheckValue = ['123', '456', '789'];
    const customCheckNames = ['abc', 'def', 'xxx'];
    const checkValues = catalogValueFactory
      .buildList(3)
      .map((value, index) => ({
        ...value,
        customizable: true,
        name: customCheckNames[index],
      }));
    const checkWithMultipleValues = {
      ...expectedCheckModalValues,
      selectedCheckValues: checkValues,
    };

    await act(async () => {
      render(<CustomCheckModal {...checkWithMultipleValues} />);
    });
    const warningBannerCheckbox = screen.getByRole('checkbox');
    await user.click(warningBannerCheckbox);
    expect(warningBannerCheckbox).toBeChecked();
    const inputElements = screen.getAllByRole('textbox');
    expect(inputElements.length).toBe(4);

    expect(inputElements[0]).toBeEnabled(); // first customizable check values
    expect(inputElements[1]).toBeEnabled(); // second customizable check values
    expect(inputElements[2]).toBeEnabled(); // third customizable check values
    expect(inputElements[3]).toBeDisabled(); // Provider is always disabled

    await user.type(inputElements[0], customCheckValue[0]);
    await user.type(inputElements[1], customCheckValue[1]);
    await user.type(inputElements[2], customCheckValue[2]);

    await user.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledWith({
      checksID: '123',
      customValues: {
        [customCheckNames[0]]: customCheckValue[0],
        [customCheckNames[1]]: customCheckValue[1],
        [customCheckNames[2]]: customCheckValue[2],
      },
    });
  });

  test('renders the modal with partial customizable values', async () => {
    const user = userEvent.setup();
    const { onSave } = expectedCheckModalValues;
    const customCheckValue = ['123', '456'];
    const customCheckNames = ['abc', 'def'];
    const customizableValues = [true, false];
    const checkValues = catalogValueFactory
      .buildList(2)
      .map((value, index) => ({
        ...value,
        customizable: customizableValues[index],
        name: customCheckNames[index],
      }));
    const checkWithMultipleValues = {
      ...expectedCheckModalValues,
      selectedCheckValues: checkValues,
    };

    await act(async () => {
      render(<CustomCheckModal {...checkWithMultipleValues} />);
    });
    const warningBannerCheckbox = screen.getByRole('checkbox');
    await user.click(warningBannerCheckbox);
    screen.debug(undefined, 10000000000000000000000000000);
    expect(warningBannerCheckbox).toBeChecked();
    const inputElements = screen.getAllByRole('textbox');
    expect(inputElements.length).toBe(3);

    expect(inputElements[0]).toBeEnabled(); // first customizable check values
    expect(inputElements[1]).toBeDisabled(); // second disabled customizable check values
    expect(inputElements[2]).toBeDisabled(); // Provider is always disabled

    await user.type(inputElements[0], customCheckValue[0]);

    await user.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledWith({
      checksID: '123',
      customValues: { [customCheckNames[0]]: customCheckValue[0] },
    });
  });
});
