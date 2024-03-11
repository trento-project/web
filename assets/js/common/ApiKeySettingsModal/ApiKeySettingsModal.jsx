import {
  addDays,
  addMonths,
  addYears,
  format,
  parseISO,
  setHours,
  setMinutes,
} from 'date-fns';
import React, { useState } from 'react';
import { noop, truncate } from 'lodash';
import { EOS_CONTENT_COPY, EOS_INFO_OUTLINED } from 'eos-icons-react';
import Button from '@common/Button';
import Modal from '@common/Modal';
import Input from '@common/Input';
import Label from '@common/Label';
import Select from '@common/Select';
import Switch from '@common/Switch';

const normalizeExpiration = (expiration) =>
  setMinutes(setHours(expiration, 0), 0);

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
  generatedApiKeyExpiration,
}) {
  const timeOptions = availableTimeOptions.map((o) => o.type);
  const [timeQuantity, setTimeQuantity] = useState(0);
  const [timeQuantityType, setTimeQuantityType] = useState(timeOptions[0]);

  const [quantityError, setQuantityError] = useState(false);
  const [timeFormEnabled, setTimeFormEnabled] = useState(true);

  const saveFormState = () => {
    if (!timeFormEnabled) {
      onSave({ apiKeyExpiration: null });
      return;
    }
    if (timeQuantity === 0 || !timeQuantity) {
      setQuantityError(true);
      return;
    }
    const timeQuantitySettings = availableTimeOptions.find(
      (q) => q.type === timeQuantityType
    );
    const apiKeyExpiration = timeQuantitySettings.timeGenerator(timeQuantity);

    onSave({ apiKeyExpiration: normalizeExpiration(apiKeyExpiration) });
  };

  return (
    <Modal
      title="API Key Settings"
      className="!w-3/4 !max-w-3xl"
      open={open}
      onClose={onClose}
    >
      <div className="flex flex-col my-5">
        <span className="my-2 mb-4 text-gray-500">
          {' '}
          By generating a new key, you will need to replace the API key on all
          hosts.{' '}
        </span>

        <div className="flex space-x-1">
          <div className="w-1/5">
            <Label>Never Expires</Label>
          </div>

          <Switch
            selected={!timeFormEnabled}
            onChange={() => {
              setTimeFormEnabled((enabled) => !enabled);
              setQuantityError(false);
            }}
          />
        </div>
        <div className="flex items-center my-2 space-x-2">
          <div className="w-1/3">
            <Label>Key Expiration</Label>
          </div>

          <div className="w-2/4">
            <Input
              value={timeQuantity}
              className="h-3/4"
              type="number"
              disabled={!timeFormEnabled}
              error={quantityError}
              onChange={({ target: { value } }) => {
                setTimeQuantity(parseInt(value, 10));
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
            <Button
              onClick={() => saveFormState()}
              disabled={quantityError || loading}
            >
              Generate
            </Button>
          </div>
        </div>
        {quantityError && (
          <span className="my-1 mb-4 text-red-500">
            {' '}
            Key expiration value needs to be greater than 0{' '}
          </span>
        )}
        {generatedApiKey && (
          <div className="flex flex-col my-1 mb-4">
            <div className="flex space-x-2">
              <div className="w-full break-words p-2 pr-2 rounded-lg bg-white border-gray-300 border">
                <code> {truncate(generatedApiKey, { length: 65 })} </code>
              </div>
              <button
                type="button"
                aria-label="generate api key"
                onClick={() => {
                  window.navigator.clipboard.writeText(generatedApiKey);
                }}
              >
                <EOS_CONTENT_COPY role="button" size="25" />
              </button>
            </div>
            <div className="flex space-x-2">
              <EOS_INFO_OUTLINED size="20" className="mt-2" />

              <div className="mt-2 text-gray-600 text-sm">
                {' '}
                Key Will Expire{' '}
                {format(parseISO(generatedApiKeyExpiration), 'd LLL yyyy')}
              </div>
            </div>
          </div>
        )}
        <div className="w-1/6 h-4/5">
          <Button type="primary-white" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ApiKeySettingsModal;
