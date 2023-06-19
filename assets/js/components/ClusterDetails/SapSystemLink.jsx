import React from 'react';

import { Link } from 'react-router-dom';

import { DATABASE_TYPE } from '@lib/model';

function SapSystemLink({ id, sid, type }) {
  return id ? (
    <Link
      className="text-jungle-green-500 hover:opacity-75"
      to={`/${type === DATABASE_TYPE ? 'databases' : 'sap_systems'}/${id}`}
    >
      <span>{sid}</span>
    </Link>
  ) : (
    <span>{sid}</span>
  );
}

export default SapSystemLink;
