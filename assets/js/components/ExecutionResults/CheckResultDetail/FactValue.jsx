import React from 'react';

import ObjectTree from '@components/ObjectTree';

function FactValue({ className, data }) {
  return typeof data === 'object' ? (
    <ObjectTree className={className} data={data} />
  ) : (
    <span className={className}>{`${data}`}</span>
  );
}

export default FactValue;
