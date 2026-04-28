import React, { useState } from 'react';

import { APPLICATION_TYPE, DATABASE_TYPE } from '@lib/model/sapSystems';
import Button from '@common/Button';

import DeregistrationModal from '.';

export default {
  title: 'Patterns/DeregistrationModal',
  component: DeregistrationModal,
  argTypes: {
    contentType: {
      control: { type: 'radio' },
      options: ['host', APPLICATION_TYPE, DATABASE_TYPE],
      description: 'The content type of the deregistration modal',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'host' },
      },
    },
    isOpen: {
      type: 'boolean',
      description: 'Sets the visibility of the modal',
      control: false,
    },
    onCleanUp: {
      description: "Callback function triggered when the user clicks the Clean up button; handles deregistration"
    },
    onCancel: {
      description: "Callback function triggered when the user clicks the Cancel button; closes the modal"
    }
  },
};

function ButtonToOpenModal({ ...rest }) {
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
        {deregistered ? `Resource deregistered` : 'Click me to open modal'}
      </Button>

      <DeregistrationModal
        isOpen={open}
        onCleanUp={() => {
          setDeregistered(true);
          setOpen(false);
        }}
        onCancel={() => {
          setDeregistered(false);
          setOpen(false);
        }}
        {...rest}
      />
    </>
  );
}

export const Host = {
  args: {
    hostname: 'example host',
  },
  render: (args) => <ButtonToOpenModal {...args} />,
};

export const ApplicationInstance = {
  args: {
    contentType: APPLICATION_TYPE,
    sid: 'PRD',
    instanceNumber: '00',
  },
  render: (args) => <ButtonToOpenModal {...args} />,
};

export const DatabaseInstance = {
  args: {
    contentType: DATABASE_TYPE,
    sid: 'PRD',
    instanceNumber: '00',
  },
  render: (args) => <ButtonToOpenModal {...args} />,
};
