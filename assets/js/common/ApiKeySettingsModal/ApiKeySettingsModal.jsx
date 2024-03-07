import { addDays, addMonths, addYears, setHours, setMinutes } from 'date-fns';
import React, { useState } from 'react';
import { noop } from 'lodash';

import Button from '@common/Button';
import Modal from '@common/Modal';
import Input, { Password, Textarea } from '@common/Input';
import Label from '@common/Label';
import Select from '@common/Select';

const normalizeExpiration = (expiration) => setMinutes(setHours(0), 0);

const availableTimeOptions = [
  {
    type: 'months',
    timeGenerator: (quantity) => addMonths(new Date(), quantity),
  },
  {
    type: 'days',
    timeGenerator: (quantity) => addDays(new Date(), quantity),
  },
  {
    type: 'years',
    timeGenerator: (quantity) => addYears(new Date(), quantity),
  },
];

function ApiKeySettingsModal({
  open = false,
  loading = false,
  onSave = noop,
  onClose = noop,
  generatedApiKey,
}) {
  const timeOptions = availableTimeOptions.map((o) => o.type);
  const [timeQuantity, setTimeQuantity] = useState(0);
  const [timeQuantityType, setTimeQuantityType] = useState(timeOptions[0]);

  const [quantityError, setQuantityError] = useState(false);
  const [timeFormEnabled, setTimeFormEnabled] = useState(true);

  return (
    <Modal title="API Key Settings" open={open} onClose={onClose}>
      <div className="flex items-center my-5 space-x-2">
        <div className="w-1/3">
          <Label>Key Expiration</Label>
        </div>

        <div className="w-2/4">
          <Input
            value={timeQuantity}
            className="h-4/5"
            type="number"
            disabled={!timeFormEnabled}
            error={quantityError}
            onChange={({ target: { value } }) => {
              setTimeQuantity(value);
              setQuantityError(false);
            }}
          />
        </div>
        <div className="w-2/4 pt-4">
          <Select
            optionsName=""
            options={timeOptions}
            disabled={!timeFormEnabled}
            value={timeQuantityType}
            onChange={(value) => setTimeQuantityType(value)}
          />
        </div>
        <div className="w-1/6 h-4/5">
          <Button>Generate</Button>
        </div>
      </div>
    </Modal>
  );
}

export default ApiKeySettingsModal;
