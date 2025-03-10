import React, { useState } from 'react';
import { noop } from 'lodash';

import Modal from '@common/Modal';
import Button from '@common/Button';
import Label from '@common/Label';
import Input from '@common/Input';
import { initPosthog } from '@lib/analytics';

function AnalyticsSettingsModal({
  open = false,
  onCancel = noop,
  onSave = noop,
  initialAnalyticsOptin,
}) {
  const [analyticsOptin, setAnalyticsOptin] = useState(initialAnalyticsOptin);
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
            checked={analyticsOptin}
            className="w-min inline mr-2"
            onChange={() => setAnalyticsOptin(!analyticsOptin)}
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
        <Button
          onClick={() => {
            const payload = {
              opt_in: analyticsOptin,
            };
            onSave(payload).then(() => {
              if (payload.opt_in) {
                //Starts Posthog if user opts in
                initPosthog();
              }
            });
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

export default AnalyticsSettingsModal;
