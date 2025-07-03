import React, { useState } from 'react';

import Button from '@common/Button';
import Modal from '@common/Modal';
import Table from '@common/Table';

function AttributesDetails({ attributes, title }) {
  const [modalOpen, setModalOpen] = useState(false);
  const attributesTableConfig = {
    usePadding: false,
    columns: [
      { title: 'Attribute', key: 'attribute' },
      { title: 'Value', key: 'value' },
    ],
  };

  return (
    <>
      <Button
        type="transparent"
        className="text-jungle-green-500"
        size="fit"
        onClick={() => setModalOpen(true)}
      >
        Details
      </Button>
      <Modal title={title} open={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="font-medium mt-6">Attributes</h3>
        <Table
          className="pt-2"
          config={attributesTableConfig}
          data={Object.keys(attributes).map((key) => ({
            attribute: key,
            value: attributes[key],
          }))}
        />
      </Modal>
    </>
  );
}

export default AttributesDetails;
