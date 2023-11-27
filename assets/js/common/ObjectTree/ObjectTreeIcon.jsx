import React from 'react';
import {
  EOS_ADD_BOX_OUTLINED,
  EOS_INDETERMINATE_CHECK_BOX_OUTLINED,
} from 'eos-icons-react';

function ObjectTreeIcon({ expanded }) {
  return expanded ? (
    <EOS_INDETERMINATE_CHECK_BOX_OUTLINED className="ml-2 self-center cursor-pointer" />
  ) : (
    <EOS_ADD_BOX_OUTLINED className="ml-2 self-center cursor-pointer" />
  );
}

export default ObjectTreeIcon;
