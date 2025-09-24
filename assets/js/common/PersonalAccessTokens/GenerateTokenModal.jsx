import React, { useState, useEffect } from 'react';

import { noop } from 'lodash';
import { EOS_INFO_OUTLINED } from 'eos-icons-react';
import { format } from 'date-fns';

import { availableSelectTimeOptions, normalizeDate } from '@lib/date';
import Button from '@common/Button';
import Modal from '@common/Modal';
import Input, { InputNumber } from '@common/Input';
import Label from '@common/Label';
import Select from '@common/Select';
import Switch from '@common/Switch';

const isValidDate = (date) =>
  date instanceof Date && !Number.isNaN(date.getTime());

function GenerateTokenModal({
  isOpen = false,
  onGenerate = noop,
  onClose = noop,
}) {
  const timeOptions = availableSelectTimeOptions.map((o) => o.type);
  const [tokenName, setTokenName] = useState('');
  const [tokenNeverExpires, setTokenNeverExpires] = useState(false);
  const [timeQuantity, setTimeQuantity] = useState(1);
  const [timeQuantityType, setTimeQuantityType] = useState(timeOptions[0]);
  const [expirationDate, setExpirationDate] = useState(null);

  useEffect(() => {
    const timeQuantitySettings = availableSelectTimeOptions.find(
      (q) => q.type === timeQuantityType
    );

    tokenNeverExpires
      ? setExpirationDate(null)
      : setExpirationDate(
          normalizeDate(timeQuantitySettings.timeGenerator(timeQuantity))
        );
  }, [tokenNeverExpires, timeQuantity, timeQuantityType]);

  useEffect(() => {
    if (isOpen) {
      setTokenName('');
      setTokenNeverExpires(false);
      setTimeQuantity(1);
      setTimeQuantityType(timeOptions[0]);
    }
  }, [isOpen]);

  return (
    <Modal
      className="!w-3/4 !max-w-3xl"
      title="Generate Personal Access Token"
      open={isOpen}
      onClose={onClose}
    >
      <div className="text-gray-500">
        Generate a personal access token that can be used by 3rd party
        applications.
      </div>
      <div className="grid grid-cols-8 mt-4 gap-4 items-center">
        <Label className="col-span-2">Name</Label>
        <div className="col-span-6">
          <Input
            id="token-name"
            name="token-name"
            aria-label="token-name"
            className="w-full"
            value={tokenName}
            placeholder="token name"
            error={null}
            onChange={({ target: { value } }) => {
              setTokenName(value);
            }}
          />
        </div>
        <Label className="col-span-2">Never Expires</Label>
        <div className="col-span-6">
          <Switch
            selected={tokenNeverExpires}
            onChange={() => {
              setTokenNeverExpires((enabled) => !enabled);
            }}
          />
        </div>
        <Label className="col-span-2">Key Expiration</Label>
        <div className="col-span-3">
          <InputNumber
            value={timeQuantity}
            className="!h-8"
            type="number"
            min="1"
            disabled={tokenNeverExpires}
            onChange={(value) => {
              setTimeQuantity(parseInt(value, 10));
            }}
          />
        </div>
        <div className="col-span-3">
          <Select
            className=""
            optionsName=""
            options={timeOptions}
            disabled={tokenNeverExpires}
            value={timeQuantityType}
            onChange={(value) => setTimeQuantityType(value)}
          />
        </div>
      </div>
      <div className="flex flex-col my-1 mb-4">
        <div className="flex space-x-2">
          <EOS_INFO_OUTLINED size="20" className="mt-2" />

          <div className="mt-2 text-gray-600 text-sm">
            {expirationDate
              ? `Key will expire ${isValidDate(expirationDate) ? format(expirationDate, 'd LLL yyyy') : ''}`
              : 'Key will never expire'}
          </div>
        </div>
      </div>
      <div className="flex justify-start gap-2 mt-4">
        <Button
          type="default-fit"
          className="inline-block mx-0.5 border-green-500 border"
          disabled={!tokenName}
          onClick={() => onGenerate(tokenName, expirationDate)}
        >
          Generate Token
        </Button>
        <Button
          type="primary-white-fit"
          className="inline-block mx-0.5 border-green-500 border"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
}

export default GenerateTokenModal;
