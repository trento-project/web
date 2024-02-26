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

  const resourceKeys =
    resources && resources.length > 0 ? Object.keys(resources[0]) : [];

  const resourcesTableConfig =
    resources.length > 0
      ? {
          usePadding: false,
          columns: [
            {
              title: 'Fail Count',
              key: resourceKeys[0],
            },
            {
              title: 'ID',
              key: resourceKeys[1],
            },
            {
              title: 'Managed',
              key: resourceKeys[2],
              render: (content) => (content ? 'True' : 'False'),
            },
            {
              title: 'Role',
              key: resourceKeys[3],
            },
            {
              title: 'Status',
              key: resourceKeys[4],
            },
            {
              title: 'Type',
              key: resourceKeys[5],
            },
          ],
        }
      : {
          usePadding: false,
          columns: [],
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
          config={attributesTableConfig}
          data={Object.keys(attributes).map((key) => ({
            attribute: key,
            value: attributes[key],
          }))}
        />

        <h3 className="font-medium mt-6">Resources</h3>
        <Table config={resourcesTableConfig} data={resources} />
      </Modal>
    </>
  );
}

export default AttributesDetails;
