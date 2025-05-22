import React, { useState } from 'react';

import { capitalize } from 'lodash';

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
          columns: [
            {
              title: 'fail count',
              key: 'fail_count',
            },
            {
              title: 'id',
              key: 'id',
            },
            {
              title: 'role',
              key: 'role',
            },
            {
              title: 'status',
              key: 'status',
            },
            {
              title: 'managed',
              key: 'managed',
              render: (content) => capitalize(`${content}`),
            },
            {
              title: 'type',
              key: 'type',
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
          className="pt-2"
          config={attributesTableConfig}
          data={Object.keys(attributes).map((key) => ({
            attribute: key,
            value: attributes[key],
          }))}
        />

        <h3 className="font-medium mt-6">Resources</h3>
        <Table
          className="pt-2"
          config={resourcesTableConfig}
          data={resources}
        />
      </Modal>
    </>
  );
}

export default AttributesDetails;
