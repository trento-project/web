import React, { useState } from 'react';

import Button from '@common/Button';
import Modal from '@common/Modal';
import Table from '@common/Table';

function AttributesDetails({ attributes, resources, title }) {
  const [modalOpen, setModalOpen] = useState(false);

  const attributesTableConfig = {
    usePadding: false,
    columns: [
      { title: 'Attribute', key: 'attribute' },
      { title: 'Value', key: 'value' },
    ],
  };

  const resourcesTableConfig =
    resources.length > 0
      ? {
          usePadding: false,
          columns: Object.keys(resources[0]).map((key) => ({
            title: key,
            key,
          })),
        }
      : { usePadding: false, columns: [] };

  return (
    <>
    <span className="text-jungle-green-500 hover:opacity-75">
      <a href="#" onClick={() => setModalOpen(true)}>
        Details
      </a>
      </span>
      <Modal title={title} open={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="font-medium">Attributes</h3>
        <Table
          config={attributesTableConfig}
          data={Object.keys(attributes).map((key) => ({
            attribute: key,
            value: attributes[key],
          }))}
        />

        <h3 className="font-medium">Resources</h3>
        <Table config={resourcesTableConfig} data={resources} />
      </Modal>
    </>
  );
}

export default AttributesDetails;
