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

  const formatValue = (key, value) => {
    if (key === 'managed') {
      return value ? 'True' : 'False';
    }
    return String(value);
  };

  const resourcesTableData = (resourceData) =>
    resourceData.map((resource) =>
      Object.entries(resource).reduce(
        (updatedResource, [key, value]) => ({
          ...updatedResource,
          [key]: formatValue(key, value),
        }),
        {}
      )
    );

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
        <Table
          config={resourcesTableConfig}
          data={resourcesTableData(resources)}
        />
      </Modal>
    </>
  );
}

export default AttributesDetails;
