import React, { useState } from 'react';

import Modal from '@common/Modal';
import Button from '@common/Button';
import Input from '@common/Input';

function AnalyticsEulaModal({ isOpen = false, onEnable, onCancel }) {
  const [checked, setChecked] = useState(false);

  return (
    <Modal
      className="!w-1/2"
      title="Collection of Anonymous Metrics"
      open={isOpen}
      onClose={() => null}
    >
      Allow the collection of{' '}
      <a
        className="text-jungle-green-500 hover:opacity-75"
        href="https://trento-project.io/docs"
        target="_blank"
        rel="noreferrer"
      >
        anonymous metrics
      </a>{' '}
      to help improve Trento. This can also be managed in your Profile.
      <div>
        <Input
          className="inline-block py-4 pr-2"
          type="checkbox"
          checked={checked}
          onChange={() => setChecked((prev) => !prev)}
        />
        Never show this message again.
      </div>
      <div className="flex flex-row space-x-2">
        <Button type="default-fit" onClick={() => onEnable(checked)}>
          Enable Analytics Collection
        </Button>
        <Button type="primary-white-fit" onClick={() => onCancel(checked)}>
          Continue without Analytics
        </Button>
      </div>
    </Modal>
  );
}

export default AnalyticsEulaModal;
