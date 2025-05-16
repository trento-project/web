import React, { useState } from 'react';
import { capitalize, noop, isEmpty } from 'lodash';

import Button from '@common/Button';
import Label from '@common/Label';
import Modal from '@common/Modal';
import Input, { Password } from '@common/Input';
import Switch from '@common/Switch';

import { hasError, getError } from '@lib/api/validationErrors';

export default function AlertingSettingsModal({
  previousSettings={},
  errors=[],
  open=false,
  loading=false,
  onSave=noop,
  onCancel=noop,
}) {
  const [alertingEnabled, setAlertingEnabled] = useState(Boolean(previousSettings.alertingEnabled));
  const [smtpServer, setSmtpServer] = useState(previousSettings.smtpServer);
  const [smtpPort, setSmtpPort] = useState(previousSettings.smtpPort);
  const [smtpUsername, setSmtpUsername] = useState(previousSettings.smtpUsername);
  const [senderEmail, setSenderEmail] = useState(previousSettings.senderEmail);
  const [recipientEmail, setRecipientEmail] = useState(previousSettings.recipientEmail);

  const [editingPassword, setEditingPassword] = useState(isEmpty(previousSettings));
  const [smtpPassword, setSmtpPassword] = useState('')

  function onSubmit(e) {
    e.preventDefault()
    const settingsPayload = {
      alertingEnabled,
      smtpServer,
      smtpPort: Number(smtpPort),
      smtpUsername,
      senderEmail,
      recipientEmail,
      ...(editingPassword && { smtpPassword }),
    }
    onSave(settingsPayload)
   }

  return (
    <Modal
      title="Enter Alerting Settings"
      open={open}
      onClose={onCancel}
    >
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-6 my-5 gap-6">
          <Label className="col-span-2" htmlFor="alerting-enabled-input">
            Send Email Alerts
          </Label>
          <div className="col-span-4">
            <Switch
              id="alerting-enabled-input"
              name="alerting-enabled-input"
              selected={alertingEnabled}
              onChange={(value) => {
                setAlertingEnabled(value);
              }}
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
              error={hasError('smtp_server', errors)}
              onChange={({ target: { value } }) => {
                setSmtpServer(value);
              }}
            />
            {hasError('smtp_server', errors) && (
              <p
                aria-label="smtp-server-input-error"
                role="alert"
                className="text-red-500 mt-1"
              >
                {capitalize(getError('smtp_server', errors))}
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
              error={hasError('smtp_port', errors)}
              onChange={({ target: { value } }) => {
                setSmtpPort(value);
              }}
            />
            {hasError('smtp_port', errors) && (
              <p
                aria-label="smtp-port-input-error"
                role="alert"
                className="text-red-500 mt-1"
              >
                {capitalize(getError('smtp_port', errors))}
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
              error={hasError('smtp_username', errors)}
              onChange={({ target: { value } }) => {
                setSmtpUsername(value);
              }}
            />
            {hasError('smtp_username', errors) && (
              <p
                aria-label="smtp-username-input-error"
                role="alert"
                className="text-red-500 mt-1"
              >
                {capitalize(getError('smtp_username', errors))}
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
                value={smtpPassword}
                error={hasError('smtp_password', errors)}
                onChange={({ target: { value } }) => {
                  setSmtpPassword(value);
                }}
              />
              {hasError('smtp_password', errors) && (
                <p
                  aria-label="smtp-password-input-error"
                  role="alert"
                  className="text-red-500 mt-1"
                >
                  {capitalize(getError('smtp_password', errors))}
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
              error={hasError('sender_email', errors)}
              onChange={({ target: { value } }) => {
                setSenderEmail(value);
              }}
            />
            {hasError('sender_email', errors) && (
              <p
                aria-label="sender-email-input-error"
                role="alert"
                className="text-red-500 mt-1"
              >
                {capitalize(getError('sender_email', errors))}
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
              error={hasError('recipient_email', errors)}
              onChange={({ target: { value } }) => {
                setRecipientEmail(value);
              }}
            />
            {hasError('recipient_email', errors) && (
              <p
                aria-label="recipient-email-input-error"
                role="alert"
                className="text-red-500 mt-1"
              >
                {capitalize(getError('recipient_email', errors))}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-row w-80 space-x-2">
          <Button isSubmitButton disabled={loading}>Save Settings</Button>
          <Button type="primary-white" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
};
