import React, { useState } from 'react';

import Button from '@components/Button';
import DeregistrationModal from '.';

export default {
  title: 'DeregistrationModal',
  component: DeregistrationModal,
  argTypes: {
    hostname: {
      type: 'string',
      description: 'The host name to confirm deregistration of',
      control: { type: 'text' },
    },
    isOpen: {
      type: 'boolean',
      description: 'Sets the visibility of the modal',
      control: false,
    },
    isError: {
      type: 'boolean',
      description: 'Sets the visibility of the error message',
      control: { type: 'boolean' },
    },
    onCleanUp: {
      description: 'Callback function to run when "Clean up" button is clicked',
      action: 'Deregistration',
      control: false,
    },
    onCancel: {
      description: 'Callback function to run when "Cancel" button is clicked',
      action: 'Cancel',
      control: false,
    },
  },
};

function ButtonToOpenModal({ hostname, isError }) {
  const [open, setOpen] = useState(false);
  const [deregistered, setDeregistered] = useState(false);

  return (
    <>
      <Button
        type="default-fit"
        className={`inline-block mx-0.5 border-green-500 border w-fit mr-2 ${
          deregistered ? 'bg-rose-500' : 'bg-jungle-green-500'
        }`}
        size="small"
        onClick={() => setOpen(true)}
      >
        {deregistered
          ? `Host ${hostname} deregistered`
          : 'Click me to open modal'}
      </Button>

      {deregistered && (
        <Button
          type="primary-white-fit"
          size="small"
          onClick={() => setDeregistered(false)}
        >
          Reset
        </Button>
      )}

      <DeregistrationModal
        hostname={hostname}
        isOpen={open}
        isError={isError}
        onCleanUp={() => {
          setDeregistered(true);
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

export const Default = {
  args: {
    hostname: 'example host',
  },
  render: (args) => <ButtonToOpenModal {...args} />,
};

export const Error = {
  args: {
    hostname: 'example host',
    isError: true,
  },
  render: (args) => <ButtonToOpenModal {...args} />,
};
