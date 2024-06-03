import React from 'react';

import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';

import userEvent from '@testing-library/user-event';

import TotpEnrollmentBox from './TotpEnrollmentBox';

describe('TotpEnrollmentBox', () => {
  it('should render the box with the secret,qr code and verification form', () => {
    const secret = faker.string.uuid();
    const qrcodeData =
      'otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example';
    render(<TotpEnrollmentBox secret={secret} qrData={qrcodeData} />);

    expect(screen.getByText(secret)).toBeVisible();
    expect(screen.getByRole('img')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Verify' })).toBeVisible();
    expect(screen.getByLabelText('totp_code')).toBeVisible();
    expect(
      screen.getByLabelText('totp_code').attributes.autocomplete.value
    ).toBe('off');
  });

  it('should fail validation if required fields are missing', async () => {
    const user = userEvent.setup();

    const secret = faker.string.uuid();
    const qrcodeData =
      'otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example';
    render(<TotpEnrollmentBox secret={secret} qrData={qrcodeData} />);

    await user.click(screen.getByRole('button', { name: 'Verify' }));

    expect(screen.getByText('Required field')).toBeVisible();
  });

  it('should errors to the field when provided', async () => {
    const errors = [
      {
        detail: 'Error validating totp code',
        source: { pointer: '/totp_code' },
        title: 'Invalid value',
      },
    ];
    const secret = faker.string.uuid();
    const qrcodeData =
      'otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example';
    render(
      <TotpEnrollmentBox secret={secret} qrData={qrcodeData} errors={errors} />
    );

    expect(screen.getByText('Error validating totp code')).toBeVisible();
  });

  it('should send the verify form value when correctly filled', async () => {
    const mockOnVerify = jest.fn();

    const user = userEvent.setup();

    const secret = faker.string.uuid();
    const qrcodeData =
      'otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example';
    render(
      <TotpEnrollmentBox
        secret={secret}
        qrData={qrcodeData}
        verifyTotp={mockOnVerify}
      />
    );

    await act(async () => {
      await user.type(screen.getByLabelText('totp_code'), '1234');
      await user.click(screen.getByRole('button', { name: 'Verify' }));
    });

    expect(mockOnVerify).toHaveBeenNthCalledWith(1, '1234');
  });
});
