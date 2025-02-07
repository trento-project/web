import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import {
  selectableCheckFactory,
  nonCustomizedValueFactory,
} from '@lib/test-utils/factories';
import CheckCustomizationModal from './CheckCustomizationModal';

const mockOnClose = jest.fn();
const mockOnSave = jest.fn();

const check = selectableCheckFactory.build({
  id: '123',
  description: 'Check Description',
  values: [
    nonCustomizedValueFactory.build({
      name: 'CheckValueName',
      customizable: true,
      current_value: '10 ',
    }),
  ],
  customized: false,
  customizable: false,
});

const expectedCheckModalValues = {
  ...check,
  open: true,
  provider: 'aws',
  onClose: mockOnClose,
  onSave: mockOnSave,
};

describe('CheckCustomizationModal', () => {
  it('renders modal with correct title, description, warning, disabled input field and a disabled save button', async () => {
    const expectedModalTitle = `Check: ${expectedCheckModalValues.id}`;
    const expectedWarningBannerText =
      'Trento & SUSE cannot be held liable for damages if system is unable to function due to custom check value.';
    const user = userEvent.setup();

    await act(async () => {
      render(<CheckCustomizationModal {...expectedCheckModalValues} />);
    });

    expect(screen.getByText(expectedModalTitle)).toBeInTheDocument();
    expect(
      screen.getByText(expectedCheckModalValues.description)
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

  it('renders the modal  with a single customizable values', async () => {
    const user = userEvent.setup();
    const customCheckValue = '999';
    const { onSave } = expectedCheckModalValues;

    await act(async () => {
      render(<CheckCustomizationModal {...expectedCheckModalValues} />);
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
      customValues: { CheckValueName: '999' },
    });
  });

  it('renders the modal with multiple customizable values', async () => {
    const user = userEvent.setup();
    const { onSave } = expectedCheckModalValues;
    const customCheckValue = ['123', '456', '789'];
    const customCheckNames = ['abc', 'def', 'xxx'];

    const checkValues = nonCustomizedValueFactory
      .buildList(3)
      .map((value, index) => ({
        ...value,
        customizable: true,
        name: customCheckNames[index],
      }));
    const checkWithMultipleValues = {
      ...expectedCheckModalValues,
      values: checkValues,
    };

    await act(async () => {
      render(<CheckCustomizationModal {...checkWithMultipleValues} />);
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

  it('renders the modal with partial customizable values', async () => {
    const user = userEvent.setup();
    const { onSave } = expectedCheckModalValues;
    const customCheckValue = ['123', '456'];
    const customCheckNames = ['abc', 'def'];

    const checkValueList = [
      nonCustomizedValueFactory.build({
        name: customCheckNames[0],
        customizable: true,
      }),
      nonCustomizedValueFactory.build({
        name: customCheckNames[1],
        customizable: false,
      }),
    ];
    const checkWithMultipleValues = {
      ...expectedCheckModalValues,
      values: checkValueList,
    };

    await act(async () => {
      render(<CheckCustomizationModal {...checkWithMultipleValues} />);
    });
    const warningBannerCheckbox = screen.getByRole('checkbox');
    await user.click(warningBannerCheckbox);
    expect(warningBannerCheckbox).toBeChecked();
    const inputElements = screen.getAllByRole('textbox');
    // 3 input elements - 1 non customizable, which is filtered out
    expect(inputElements.length).toBe(2);

    expect(inputElements[0]).toBeEnabled(); // first customizable check values
    expect(inputElements[1]).toBeDisabled(); // Provider is always disabled

    await user.type(inputElements[0], customCheckValue[0]);

    await user.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledWith({
      checksID: '123',
      customValues: { [customCheckNames[0]]: customCheckValue[0] },
    });
  });
});
