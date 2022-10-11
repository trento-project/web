import React from 'react';

import ListView from '@components/ListView';

const NutanixDetails = ({ provider }) => {
  return (
    <div className="mt-4 bg-white shadow rounded-lg py-4 px-8">
      <ListView
        orientation="vertical"
        rows={2}
        data={[
          {
            title: 'Provider',
            content: provider,
            render: (content) => <p className="capitalize">{content}</p>,
          },
        ]}
      />
    </div>
  );
};

export default NutanixDetails;
