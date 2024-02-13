import React, { useState } from 'react';
import { noop } from 'lodash';
import { format } from 'date-fns';
import { EOS_LOCK_OUTLINED } from 'eos-icons-react';

import Button from '@common/Button';
import Modal from '@common/Modal';
import Input, { Password, Textarea } from '@common/Input';
import Label from '@common/Label';

import { hasError } from './errors';

const defaultErrors = [];

function SuseManagerSettingsModal({
  open = false,
  loading = false,
  initialUsername,
  initialUrl,
  certUploadDate,
  errors = defaultErrors,
  onSave = noop,
  onCancel = noop,
  onClearErrors = noop,
}) {
  const settingsExist = Boolean(certUploadDate);

  const [url, setUrl] = useState(initialUrl);
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState('');
  const [certificate, setCertificate] = useState('');
  const [editingCertificate, setEditingCertificate] = useState(!settingsExist);
  const [editingPassword, setEditingPassword] = useState(!settingsExist);

  return (
    <Modal title="Enter SUSE Manager Settings" open={open} onClose={onCancel}>
      <div className="grid grid-cols-6 items-center my-5 gap-6">
        <Label className="col-span-2" required>
          SUSE Manager URL
        </Label>
        <Input
          className="col-span-4"
          value={url}
          placeholder="Enter a URL"
          error={hasError('url', errors)}
          onChange={({ target: { value } }) => {
            setUrl(value);
            onClearErrors();
          }}
        />
        <Label
          className="col-span-2 self-start"
          info="Only required for self-signed certificates"
        >
          CA Certificate
        </Label>
        {editingCertificate ? (
          <Textarea
            className="col-span-4"
            value={certificate}
            placeholder="Starts with -----BEGIN CERTIFICATE-----"
            error={hasError('ca_cert', errors)}
            onChange={({ target: { value } }) => {
              setCertificate(value);
              onClearErrors();
            }}
          />
        ) : (
          <div className="col-span-4 flex flex-row items-center justify-start p-5 border border-gray-200 rounded-md">
            <EOS_LOCK_OUTLINED className="mr-3" size="25" />
            <div>
              <div>Certificate Uploaded</div>
              <div className="text-xs">
                {format(certUploadDate, "'Uploaded:' dd MMM y")}
              </div>
            </div>
            <div className="flex flex-row grow justify-end">
              <Button type="danger" onClick={() => setEditingCertificate(true)}>
                Remove
              </Button>
            </div>
          </div>
        )}
        <Label className="col-span-2" required>
          Username
        </Label>
        <Input
          className="col-span-4"
          value={username}
          placeholder="Enter a SUSE Manager username"
          error={hasError('username', errors)}
          onChange={({ target: { value } }) => {
            setUsername(value);
            onClearErrors();
          }}
        />
        <Label className="col-span-2" required>
          Password
        </Label>
        {editingPassword ? (
          <Password
            className="col-span-4"
            value={password}
            placeholder="Enter a SUSE Manager password"
            error={hasError('password', errors)}
            onChange={({ target: { value } }) => {
              setPassword(value);
              onClearErrors();
            }}
          />
        ) : (
          <div className="col-span-4 border border-gray-200 p-5 rounded-md">
            <p className="inline align-sub leading-10">•••••</p>
            <Button
              className="float-right"
              type="danger"
              onClick={() => setEditingPassword(true)}
            >
              Remove
            </Button>
          </div>
        )}

        <p className="col-span-6">
          <span className="text-red-500">*</span> Required Fields
        </p>
      </div>
      <div className="flex flex-row w-80 space-x-2">
        <Button
          disabled={loading}
          onClick={() => {
            const payload = {
              url,
              username,
              ...(editingCertificate && { certificate }),
              ...(editingPassword && { password }),
            };
            onSave(payload);
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
}

export default SuseManagerSettingsModal;
