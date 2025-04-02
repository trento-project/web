import React, { useState } from 'react';
import { capitalize, noop, isEmpty } from 'lodash';

import Button from '@common/Button';
import Label from '@common/Label';
import Modal from '@common/Modal';
import Input, { Password } from '@common/Input';

import { hasError, getError } from '@lib/api/validationErrors';

export default function AlertingSettingsModal({
  settings={},
  open=false,
  loading=false,
  errors=[],
  onCancel=noop,
}) {
  const {
    alertingEnabled,
    smtpServer,
    smtpPort,
    smtpUsername,
    senderEmail,
    recipientEmail,
  } = settings
  const previouslySet = !isEmpty(settings)
  const [editingPassword, setEditingPassword] = useState(!previouslySet);

  return (
    <Modal
      title="Enter Alerting Settings"
      open={open}
      onClose={onCancel}
    >
      <div className="grid grid-cols-6 my-5 gap-6">
        <Label className="col-span-2" htmlFor="alerting-enabled-input">
          Send Email Alerts
        </Label>
        <div className="col-span-4">
          <input
            id="alerting-enabled-input"
            name="alerting-enabled-input"
            type="checkbox"
            checked={alertingEnabled}
            /* error={hasError('smtpServer', errors)} */
            /* onChange={({ target: { value } }) => { */
            /*   setUrl(value); */
            /*   onClearErrors(); */
            /* }} */
          />
        </div>

        <Label className="col-span-2" htmlFor="smtp-server-input" required>
          SMTP Server
        </Label>
        <div className="col-span-4">
          <Input
            id="smtp-server-input"
            name="smtp-server-input"
            value={smtpServer}
            placeholder="Enter a URL"
            error={hasError('smtpServer', errors)}
            /* onChange={({ target: { value } }) => { */
            /*   setUrl(value); */
            /*   onClearErrors(); */
            /* }} */
          />
          {hasError('smtpServer', errors) && (
            <p
              aria-label="smtp-server-input-error"
              role="alert"
              className="text-red-500 mt-1"
            >
              {capitalize(getError('smtpServer', errors))}
            </p>
          )}
        </div>

        <Label className="col-span-2" htmlFor="smtp-port-input" required>
          SMTP Port
        </Label>
        <div className="col-span-4">
          <Input
            id="smtp-port-input"
            name="smtp-port-input"
            value={smtpPort}
            placeholder={587}
            error={hasError('smtpPort', errors)}
            /* onChange={({ target: { value } }) => { */
            /*   setUsername(value); */
            /*   onClearErrors(); */
            /* }} */
          />
          {hasError('smtpPort', errors) && (
            <p
              aria-label="smtp-port-input-error"
              role="alert"
              className="text-red-500 mt-1"
            >
              {capitalize(getError('smtpPort', errors))}
            </p>
          )}
        </div>

        <Label className="col-span-2" htmlFor="smtp-username-input" required>
          SMTP Username
        </Label>
        <div className="col-span-4">
          <Input
            id="smtp-username-input"
            name="smtp-username-input"
            value={smtpUsername}
            placeholder="Enter SMTP Username"
            error={hasError('smtpUsername', errors)}
            /* onChange={({ target: { value } }) => { */
            /*   setUsername(value); */
            /*   onClearErrors(); */
            /* }} */
          />
          {hasError('smtpUsername', errors) && (
            <p
              aria-label="smtp-username-input-error"
              role="alert"
              className="text-red-500 mt-1"
            >
              {capitalize(getError('smtpUsername', errors))}
            </p>
          )}
        </div>

        <Label className="col-span-2" id="smtp-password-label" htmlFor="smtp-password-input" required>
          SMTP Password
        </Label>
        {editingPassword ? (
          <div className="col-span-4">
            <Password
              aria-labelledby="smtp-password-label"
              name="smtp-password-input"
              placeholder="Enter SMTP Password"
              error={hasError('smtpPassword', errors)}
              /* onChange={({ target: { value } }) => { */
              /*   setPassword(value); */
              /*   onClearErrors(); */
              /* }} */
            />
            {hasError('smtpPassword', errors) && (
              <p
                aria-label="smtp-password-input-error"
                className="text-red-500 mt-1"
              >
                {capitalize(getError('smtpPassword', errors))}
              </p>
            )}
          </div>
        ) : (
         <div className="col-span-4 border border-gray-200 p-5 rounded-md">
           <p
             aria-labelledby="smtp-password-label"
             className="inline align-sub leading-10"
           >
              •••••
           </p>
            <Button
              className="float-right"
              type="danger"
              onClick={() => setEditingPassword(true)}
            >
              Remove
            </Button>
          </div>
        )}

        <Label className="col-span-2" htmlFor="sender-email-input" required>
          Alert Sender
        </Label>
        <div className="col-span-4">
          <Input
            id="sender-email-input"
            name="sender-email-input"
            value={senderEmail}
            placeholder="Enter an email address"
            error={hasError('senderEmail', errors)}
            /* onChange={({ target: { value } }) => { */
            /*   setUsername(value); */
            /*   onClearErrors(); */
            /* }} */
          />
          {hasError('senderEmail', errors) && (
            <p
              aria-label="sender-email-input-error"
              role="alert"
              className="text-red-500 mt-1"
            >
              {capitalize(getError('senderEmail', errors))}
            </p>
          )}
        </div>

        <Label className="col-span-2" htmlFor="recipient-email-input" required>
          Alert Recipient
        </Label>
        <div className="col-span-4">
          <Input
            id="recipient-email-input"
            name="recipient-email-input"
            value={recipientEmail}
            placeholder="Enter an email address"
            error={hasError('recipientEmail', errors)}
            /* onChange={({ target: { value } }) => { */
            /*   setUsername(value); */
            /*   onClearErrors(); */
            /* }} */
          />
          {hasError('recipientEmail', errors) && (
            <p
              aria-label="recipient-email-input-error"
              role="alert"
              className="text-red-500 mt-1"
            >
              {capitalize(getError('recipientEmail', errors))}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-row w-80 space-x-2">
        <Button
          disabled={loading}
          onClick={() => {
            // const payload = {
            //   url,
            //   username,
            //   ...getCertificatePayload(
            //     certUploadDate,
            //     editingCertificate,
            //     certificate
            //   ),
            //   ...(editingPassword && { password }),
            // };
            // onSave(payload);
          }}
        >
          Save Settings
        </Button>
        <Button type="primary-white" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};
