import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Input from '@common/Input';
import { getError } from '@lib/api/validationErrors';
import Button from '@common/Button';
import { REQUIRED_FIELD_TEXT, errorMessage } from '@lib/forms';

export default function TotpEnrollmentBox({
  secret,
  qrData,
  loading,
  errors,
  verifyTotp,
}) {
  const [verificationTotp, setVerificationTotp] = useState('');
  const [verificationTotpError, setVerificationTotpError] = useState(null);

  const onVerifyTotp = () => {
    if (!verificationTotp) {
      setVerificationTotpError(REQUIRED_FIELD_TEXT);
      return;
    }

    verifyTotp(verificationTotp);
  };

  useEffect(() => {
    setVerificationTotpError(getError('totp_code', errors));
  }, [errors]);

  return (
    <div className="container max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg">
      <div className="flex flex-col">
        <div>Your new TOTP secret is: </div>
        <div className="font-bold text-lg">{secret}</div>
        <div className="mt-1">
          For quick setup, scan this QR code with your Authenticator App.
        </div>
        <div className="mt-4">
          <QRCodeSVG value={qrData} role="img" />
        </div>
        <div className="mt-4">
          After you have configured your App, enter a test code below to ensure
          everything works correctly.
        </div>
        <div className="mt-4 flex space-x-4">
          <Input
            autoComplete="off"
            placeholder="TOTP code"
            name="totp_code"
            aria-label="totp_code"
            value={verificationTotp}
            onChange={(e) => setVerificationTotp(e.target.value)}
          />

          <Button disabled={loading} type="default-fit" onClick={onVerifyTotp}>
            Verify
          </Button>
        </div>
        <div className="mt-2">
          {verificationTotpError && errorMessage(verificationTotpError)}
        </div>
      </div>
    </div>
  );
}
