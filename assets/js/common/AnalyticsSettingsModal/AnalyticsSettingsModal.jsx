import React, { useState } from 'react';
import { noop } from 'lodash';

import Modal from '@common/Modal';
import Button from '@common/Button';
import Label from '@common/Label';
import Input from '@common/Input';

function AnalyticsSettingsModal({
  open = false,
  onCancel = noop,
  onSave = noop,
}) {
  const [checked, setChecked] = useState(true);
  return (
    <Modal
      title="Enter Analytics Opt-in Settings"
      open={open}
      onClose={onCancel}
    >
      <div className="text-gray-500">
        Here you can configure your analytics collection preference.
      </div>
      <div className="grid grid-cols-6 my-5 gap-6">
        <Label className="col-span-2">Collect Analytics</Label>
        <div className="col-span-4">
          <Input
            type="checkbox"
            checked={checked}
            className="w-min inline mr-2"
            onChange={(prev) => setChecked(!checked)}
          />
          Allow the collection of{' '}
          <a
            href="#"
            target="_blank"
            className="text-jungle-green-500 hover:opacity-75"
          >
            anonymous metrics
          </a>{' '}
          to help improve Trento.
        </div>
      </div>

      <div className="flex flex-row w-80 space-x-2">
        <Button onClick={onSave}>Save Settings</Button>
        <Button type="primary-white" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

export default AnalyticsSettingsModal;
