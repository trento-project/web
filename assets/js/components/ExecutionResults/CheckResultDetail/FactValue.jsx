import React from 'react';

import ObjectTree from '@components/ObjectTree';

function FactValue({ className, data }) {
  if (data === null) {
    return <span className={className}>null</span>;
  }
  if (typeof data === 'object') {
    return <ObjectTree className={className} data={data} />;
  }
  return <span className={className}>{`${data}`}</span>;
}

export default FactValue;
