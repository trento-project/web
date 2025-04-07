import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import {
  selectableCheckFactory,
  nonCustomizedValueFactory,
} from '@lib/test-utils/factories';

import {
  READY,
  ONGOING,
  INVALID_VALUES,
  GENERIC_FAILURE,
} from '@pages/ChecksSelection/hooks';

import CheckCustomizationModal from './CheckCustomizationModal';

const mockOnClose = jest.fn();
const mockOnSave = jest.fn();
const mockOnReset = jest.fn();

const check = selectableCheckFactory.build({
  id: '123',
  description: 'Check Description',
  values: [
    nonCustomizedValueFactory.build({
      name: 'CheckIntValueName',
      customizable: true,
      default_value: 10,
    }),
    nonCustomizedValueFactory.build({
      name: 'CheckStringValueName',
      customizable: true,
      default_value: 'stringValue',
    }),
    nonCustomizedValueFactory.build({
      name: 'CheckBoolValueName',
      customizable: true,
      default_value: true,
    }),
  ],
  customized: false,
  customizable: false,
});

const checkCustomizationModalProps = {
  ...check,
  open: true,
  provider: 'aws',
  groupID: '123456789',
  onClose: mockOnClose,
  onSave: mockOnSave,
  onReset: mockOnReset,
  customizationStatus: READY,
};

describe('CheckCustomizationModal', () => {
  it('renders modal with correct title, description, warning, disabled input fields and a disabled save button', async () => {
    const expectedModalTitle = `Check: ${checkCustomizationModalProps.id}`;
    const expectedWarningBannerText =
      'Trento and SUSE are not responsible for cluster operation failure due to deviation from Best Practices.';
    const user = userEvent.setup();

    await act(async () => {
      render(<CheckCustomizationModal {...checkCustomizationModalProps} />);
    });

    expect(screen.getByText(expectedModalTitle)).toBeInTheDocument();
    expect(
      screen.getByText(checkCustomizationModalProps.description)
    ).toBeInTheDocument();
    expect(screen.getByText(expectedWarningBannerText)).toBeInTheDocument();
    const warningBannerCheckbox = screen.getByRole('checkbox');
    expect(warningBannerCheckbox).not.toBeChecked();
    expect(screen.getByText('Save')).toBeDisabled();
    const inputElements = screen.getAllByRole('textbox'); // All textbox modal inputs
    expect(inputElements[0]).toBeDisabled(); // Customizable check value integer
    expect(inputElements[1]).toBeDisabled(); // Customizable check value string
    const radioInputs = screen.getAllByRole('radio'); // Get all radio buttons for the boolean check value
    expect(radioInputs).toHaveLength(2); // Only true and false input
    expect(radioInputs.find((input) => input.value === 'true')).toBeDisabled(); // Validate if the true radio button is disabled
    expect(radioInputs.find((input) => input.value === 'false')).toBeDisabled(); // Validate if the false radio button is disabled
    expect(inputElements[2]).toBeDisabled(); // Provider is always disabled

    await user.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders the modal with multiple customizable values', async () => {
    const user = userEvent.setup();
    const customCheckValue = ['999', 'veryImportantValue', false];
    const expectedCheckValues = [999, 'veryImportantValue', false];
    const { onSave } = checkCustomizationModalProps;

    await act(async () => {
      render(<CheckCustomizationModal {...checkCustomizationModalProps} />);
    });

    const warningBannerCheckbox = screen.getByRole('checkbox');
    expect(warningBannerCheckbox).not.toBeChecked();
    await user.click(warningBannerCheckbox);
    expect(warningBannerCheckbox).toBeChecked();
    const inputElements = screen.getAllByRole('textbox');
    expect(inputElements[0]).toBeEnabled(); // first customizable int check values
    await user.clear(inputElements[0]); // clear the current value
    await user.type(inputElements[0], customCheckValue[0]);

    expect(inputElements[1]).toBeEnabled(); // second customizable string check values
    await user.clear(inputElements[1]); // clear the current value
    await user.type(inputElements[1], customCheckValue[1]);

    const radioInputs = screen.getAllByRole('radio'); // Get all radio buttons for the boolean check value
    expect(radioInputs).toHaveLength(2); // Only true and false input
    expect(radioInputs.find((input) => input.value === 'true')).toBeEnabled(); // Validate if the true radio button is enabled
    expect(radioInputs.find((input) => input.value === 'false')).toBeEnabled(); // Validate if the false radio button is enabled
    const falseRadioInput = radioInputs.find(
      (input) => input.value === 'false'
    );
    await user.click(falseRadioInput);
    expect(inputElements[2]).toBeDisabled(); // Provider is always disabled

    await user.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledWith('123', '123456789', [
      { name: 'CheckIntValueName', value: expectedCheckValues[0] },
      { name: 'CheckStringValueName', value: expectedCheckValues[1] },
      { name: 'CheckBoolValueName', value: expectedCheckValues[2] },
    ]);
  });

  it('renders the modal with partial customizable values', async () => {
    const user = userEvent.setup();
    const { onSave } = checkCustomizationModalProps;
    const customCheckValue = ['123', '456'];
    const expectedCustomCheckValue = 123;
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
      ...checkCustomizationModalProps,
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

    await user.clear(inputElements[0]); // user clears the current initial value
    await user.type(inputElements[0], customCheckValue[0]);

    await user.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledWith('123', '123456789', [
      { name: customCheckNames[0], value: expectedCustomCheckValue },
    ]);
  });

  it('should disable reset customization button if check is not customized', async () => {
    await act(async () => {
      render(<CheckCustomizationModal open customized={false} />);
    });

    expect(screen.getByText('Reset Check')).toBeDisabled();
  });

  it('should call onReset when reset button is clicked', async () => {
    const user = userEvent.setup();
    const { onReset } = checkCustomizationModalProps;

    await act(async () => {
      render(
        <CheckCustomizationModal {...checkCustomizationModalProps} customized />
      );
    });

    await user.click(screen.getByText('Reset Check'));
    expect(onReset).toHaveBeenCalled();
  });

  it.each`
    customizationStatus | expectedMessage
    ${READY}            | ${null}
    ${ONGOING}          | ${null}
    ${INVALID_VALUES}   | ${'Some of the values are invalid. Please correct them and try again'}
    ${GENERIC_FAILURE}  | ${'An error occurred while saving custom values'}
  `(
    'should show error message when customization status is failed',
    async ({ customizationStatus, expectedMessage }) => {
      await act(async () => {
        render(
          <CheckCustomizationModal
            {...checkCustomizationModalProps}
            customizationStatus={customizationStatus}
          />
        );
      });

      expectedMessage
        ? expect(screen.getByText(expectedMessage)).toBeVisible()
        : expect(screen.queryByTestId('error-message')).toBeNull();
    }
  );

  it('should not allow saving customization while another one is ongoing', async () => {
    await act(async () => {
      render(
        <CheckCustomizationModal
          {...checkCustomizationModalProps}
          customizationStatus={ONGOING}
        />
      );
    });

    expect(screen.getByText('Save')).toBeDisabled();
  });
});
