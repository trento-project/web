import React, { useState } from 'react';

import Button from '@components/Button';
import DeregistrationModal from '.';

export default {
  title: 'DeregistrationModal',
  component: DeregistrationModal,

  args: {
    hostName: 'example host',
    isOpen: false,
  },

  argTypes: {
    hostName: {
      type: 'string',
      description: 'The host name to confirm deregistration of',
      control: { type: 'text' },
    },
    isOpen: {
      type: 'boolean',
      description: 'Sets the visibility of the modal',
      control: false,
    },
    onCleanUp: {
      description: 'Callback function to run when "Clean up" button is clicked',
      action: 'Deregistration',
      control: false,
    },
    onClose: {
      description: 'Callback function to run when "Cancel" button is clicked',
      action: 'Cancel',
      control: false,
    },
  },
};

export function Default({ hostName, onCleanUp, onClose }) {
  const [open, setOpen] = useState(false);
  const [deregistered, setDeregistered] = useState(false);

  return (
    <>
      <Button
        type="default-fit"
        className={`inline-block mx-0.5 border-green-500 border w-fit ${
          deregistered ? 'bg-rose-500' : 'bg-jungle-green-500'
        }`}
        size="small"
        onClick={() => setOpen(true)}
      >
        {deregistered
          ? `Host ${hostName} deregistered`
          : 'Click me to open modal'}
      </Button>

      <DeregistrationModal
        hostName={hostName}
        isOpen={open}
        onCleanUp={() => {
          onCleanUp();
          setDeregistered(true);
          setOpen(false);
        }}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
      />
    </>
  );
}
