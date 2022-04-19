import React, { Fragment, useState } from 'react';

import Button from '@components/Button';
import Modal from '@components/Modal';
import Table from '@components/Table';

const SiteDetails = ({ attributes, resources }) => {
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
      : { usePAdding: false, columns: [] };

  return (
    <Fragment>
      <Button type="primary" size="small" onClick={() => setModalOpen(true)}>
        Details
      </Button>
      <Modal
        title="Site details"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
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
    </Fragment>
  );
};

export default SiteDetails;
