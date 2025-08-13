import React, { useState } from 'react';

import Button from '@common/Button/Button';
import AnalyticsEulaModal from './AnalyticsEulaModal';

export default {
  title: 'Patterns/AnalyticsEulaModal',
  component: AnalyticsEulaModal,
  argTypes: {
    checked: {
      type: 'boolean',
      description: 'Checks checkbox',
    },
    isOpen: {
      type: 'boolean',
      description: 'Sets the visibility of the modal',
    },
  },
};

function ButtonToOpenModal({ ...rest }) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  return (
    <>
      <Button type="default-fit" onClick={() => setOpen(true)}>
        Show Modal
      </Button>

      <AnalyticsEulaModal
        isOpen={open}
        checked={checked}
        onEnable={() => {
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
        onChecked={() => setChecked((prev) => !prev)}
        {...rest}
      />
    </>
  );
}

export const Default = {
  args: {},
  render: (args) => <ButtonToOpenModal {...args} />,
};
