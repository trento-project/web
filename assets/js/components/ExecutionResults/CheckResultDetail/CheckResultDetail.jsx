import React from 'react';

import ObjectTree from '@components/ObjectTree/ObjectTree';

function CheckResultDetail({ executionData }) {
  return (
    <>
      <div className="tn-cluster-details w-full my-4 mr-4 bg-white shadow rounded-lg px-8 py-4">
        Expectations
      </div>
      <div className="tn-cluster-details w-full my-4 mr-4 bg-white shadow rounded-lg px-8 py-4">
        Values
      </div>
      <div className="tn-cluster-details w-full my-4 mr-4 bg-white shadow rounded-lg px-8 py-4">
        Facts
        <div className="mt-3">
          <ObjectTree data={executionData || {}} />
        </div>
      </div>
    </>
  );
}

export default CheckResultDetail;
